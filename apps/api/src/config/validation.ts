import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('8h'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  STORAGE_DRIVER: Joi.string().default('local'),
});
