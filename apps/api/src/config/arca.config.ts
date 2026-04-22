export default () => ({
  defaultEnvironment: 'TESTING',
  defaultService: process.env.ARCA_DEFAULT_SERVICE || 'wsfe',
  wsaaTestingUrl:
    process.env.ARCA_WSAA_TESTING_URL || 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
  certificatesBasePath: process.env.ARCA_CERTIFICATES_BASE_PATH || '',
  opensslBin: process.env.ARCA_OPENSSL_BIN || 'openssl',
  privateKeyPassphrase: process.env.ARCA_PRIVATE_KEY_PASSPHRASE || '',
  wsaaTimeoutMs: Number(process.env.ARCA_WSAA_TIMEOUT_MS || 15000),
});
