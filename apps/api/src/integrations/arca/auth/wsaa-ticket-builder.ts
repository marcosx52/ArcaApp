export type WsaaTicketRequest = {
  xml: string;
  uniqueId: number;
  generationTime: Date;
  expirationTime: Date;
  serviceName: string;
};

type BuildWsaaTicketRequestOptions = {
  serviceName?: string;
  now?: Date;
};

const GENERATION_SKEW_MS = 10 * 60 * 1000;
const EXPIRATION_WINDOW_MS = 10 * 60 * 1000;

export function buildWsaaTicketRequest(options: BuildWsaaTicketRequestOptions = {}) {
  return buildWsaaTicketRequestWithMetadata(options).xml;
}

export function buildWsaaTicketRequestWithMetadata(
  options: BuildWsaaTicketRequestOptions = {},
): WsaaTicketRequest {
  const now = options.now || new Date();
  const generationTime = new Date(now.getTime() - GENERATION_SKEW_MS);
  const expirationTime = new Date(now.getTime() + EXPIRATION_WINDOW_MS);
  const serviceName = options.serviceName || 'wsfe';
  const uniqueId = Math.floor(now.getTime() / 1000);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<loginTicketRequest version="1.0">',
    '  <header>',
    `    <uniqueId>${uniqueId}</uniqueId>`,
    `    <generationTime>${generationTime.toISOString()}</generationTime>`,
    `    <expirationTime>${expirationTime.toISOString()}</expirationTime>`,
    '  </header>',
    `  <service>${escapeXml(serviceName)}</service>`,
    '</loginTicketRequest>',
  ].join('\n');

  return {
    xml,
    uniqueId,
    generationTime,
    expirationTime,
    serviceName,
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
