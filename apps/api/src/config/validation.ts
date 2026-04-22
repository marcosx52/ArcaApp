import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('8h'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  STORAGE_DRIVER: Joi.string().default('local'),
  ARCA_DEFAULT_SERVICE: Joi.string().default('wsfe'),
  ARCA_WSAA_TESTING_URL: Joi.string()
    .uri()
    .default('https://wsaahomo.afip.gov.ar/ws/services/LoginCms'),
  ARCA_CERTIFICATES_BASE_PATH: Joi.string().allow('').optional(),
  ARCA_OPENSSL_BIN: Joi.string().default('openssl'),
  ARCA_PRIVATE_KEY_PASSPHRASE: Joi.string().allow('').optional(),
  ARCA_WSAA_TIMEOUT_MS: Joi.number().integer().min(1000).default(15000),
});
