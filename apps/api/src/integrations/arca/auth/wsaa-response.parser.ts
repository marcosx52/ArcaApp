export function parseWsaaResponse(_xml: string) {
  return {
    token: 'mock-token',
    sign: 'mock-sign',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
  };
}
