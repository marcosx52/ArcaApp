import { Injectable } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { WsaaSigningError } from '../shared/arca-errors';

const execFileAsync = promisify(execFile);

type SignCmsOptions = {
  certificatePath: string;
  privateKeyPath: string;
  opensslBin: string;
  privateKeyPassphrase: string;
  timeoutMs: number;
};

@Injectable()
export class WsaaCmsSigner {
  async sign(traXml: string, options: SignCmsOptions): Promise<string> {
    await this.assertReadable(options.certificatePath, 'certificado');
    await this.assertReadable(options.privateKeyPath, 'clave privada');

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'arca-wsaa-'));
    const traPath = path.join(tempDir, 'login-ticket-request.xml');
    const cmsPath = path.join(tempDir, 'login-ticket-request.cms');

    try {
      await writeFile(traPath, traXml, 'ascii');
      await this.runOpenSsl(traPath, cmsPath, options);

      const cms = await readFile(cmsPath);
      return cms.toString('base64');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private async runOpenSsl(traPath: string, cmsPath: string, options: SignCmsOptions) {
    const commands = [
      ['cms', ...this.buildCommonArgs(traPath, cmsPath, options)],
      ['smime', ...this.buildCommonArgs(traPath, cmsPath, options)],
    ];

    let lastError: unknown;

    for (const args of commands) {
      try {
        await execFileAsync(options.opensslBin, args, {
          timeout: options.timeoutMs,
          env: {
            ...process.env,
            ARCA_PRIVATE_KEY_PASSPHRASE: options.privateKeyPassphrase || '',
          },
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw new WsaaSigningError(
      `No se pudo firmar el TRA con OpenSSL. ${this.formatOpenSslError(lastError)}`,
    );
  }

  private buildCommonArgs(traPath: string, cmsPath: string, options: SignCmsOptions) {
    return [
      '-sign',
      '-in',
      traPath,
      '-out',
      cmsPath,
      '-signer',
      options.certificatePath,
      '-inkey',
      options.privateKeyPath,
      '-nodetach',
      '-outform',
      'DER',
      '-binary',
      '-md',
      'sha256',
      '-passin',
      'env:ARCA_PRIVATE_KEY_PASSPHRASE',
    ];
  }

  private async assertReadable(filePath: string, label: string) {
    try {
      await access(filePath);
    } catch {
      throw new WsaaSigningError(`No se puede leer el ${label} ARCA en ${filePath}`);
    }
  }

  private formatOpenSslError(error: unknown) {
    if (!error || typeof error !== 'object') {
      return '';
    }

    const maybeProcessError = error as { stderr?: string; message?: string };
    return (maybeProcessError.stderr || maybeProcessError.message || '').trim();
  }
}
