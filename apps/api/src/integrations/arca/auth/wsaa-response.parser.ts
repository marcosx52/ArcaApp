import { WsaaParsingError } from '../shared/arca-errors';

export function parseWsaaResponse(xml: string) {
  const fault = readXmlTag(xml, 'faultstring') || readXmlTag(xml, 'faultcode');

  if (fault) {
    throw new WsaaParsingError(`WSAA rechazo el loginCms: ${fault}`);
  }

  const loginCmsReturn = readXmlTag(xml, 'loginCmsReturn');
  const loginTicketResponse = loginCmsReturn ? decodeXmlEntities(loginCmsReturn) : xml;

  const token = readXmlTag(loginTicketResponse, 'token');
  const sign = readXmlTag(loginTicketResponse, 'sign');
  const expirationTime = readXmlTag(loginTicketResponse, 'expirationTime');

  if (!token || !sign || !expirationTime) {
    throw new WsaaParsingError('La respuesta de WSAA no contiene token, sign o expirationTime');
  }

  const expiresAt = new Date(expirationTime);

  if (Number.isNaN(expiresAt.getTime())) {
    throw new WsaaParsingError('La respuesta de WSAA contiene un expirationTime invalido');
  }

  return {
    token,
    sign,
    expiresAt,
  };
}

function readXmlTag(xml: string, tagName: string) {
  const tagPattern = new RegExp(
    `<(?:[\\w.-]+:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${tagName}>`,
    'i',
  );
  const match = xml.match(tagPattern);
  const value = match?.[1]?.trim();

  if (!value) {
    return null;
  }

  return decodeXmlEntities(stripCdata(value));
}

function stripCdata(value: string) {
  const cdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return cdata?.[1] ?? value;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
