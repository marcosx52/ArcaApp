# WSAA homologacion local

Prueba local minima para ejecutar `WsaaAuthService.getTicket(companyId)` sin abrir endpoints.

## Comando

```bash
pnpm --filter api arca:wsaa:test -- --companyId=<companyId>
```

Tambien se puede definir `ARCA_TEST_COMPANY_ID` en `apps/api/.env` y ejecutar:

```bash
pnpm --filter api arca:wsaa:test
```

Por seguridad, el comando muestra `token` y `sign` con longitud y preview. Para ver los valores completos:

```bash
pnpm --filter api arca:wsaa:test -- --companyId=<companyId> --show-secrets
```

## Variables requeridas

- `DATABASE_URL`: conexion a la base usada por Prisma.
- `JWT_SECRET`: requerido por la validacion global de config.
- `ARCA_CERTIFICATES_BASE_PATH`: carpeta base donde estan el certificado y la private key.
- `ARCA_OPENSSL_BIN`: ejecutable de OpenSSL. Por defecto `openssl`.
- `ARCA_WSAA_TESTING_URL`: endpoint WSAA homologacion. Por defecto `https://wsaahomo.afip.gov.ar/ws/services/LoginCms`.
- `ARCA_DEFAULT_SERVICE`: servicio WSAA. Por defecto `wsfe`.
- `ARCA_PRIVATE_KEY_PASSPHRASE`: passphrase de la private key si aplica.
- `ARCA_WSAA_TIMEOUT_MS`: timeout de firma/llamada. Por defecto `15000`.
- `ARCA_TEST_COMPANY_ID`: opcional si no se pasa `--companyId`.

## Archivos y datos requeridos

- Registro `Company` existente para el `companyId`.
- Registro `CompanyCertificate` con:
  - `environment = TESTING`
  - `certificateStatus = VALID` o `UPLOADED`
  - `certificateStorageKey` apuntando al certificado
  - `privateKeyStorageKey` apuntando a la private key
- Los archivos se resuelven contra `ARCA_CERTIFICATES_BASE_PATH` si las rutas no son absolutas.

## Resultado esperado

- `WSAA homologacion OK`
- `token obtenido`
- `sign obtenido`
- `expiresAt`

Si falta certificado, key u OpenSSL, el comando imprime `WSAA homologacion ERROR` con el mensaje concreto.
