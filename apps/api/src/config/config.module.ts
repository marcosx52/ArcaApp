import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import authConfig from './auth.config';
import dbConfig from './db.config';
import storageConfig from './storage.config';
import arcaConfig from './arca.config';
import { validationSchema } from './validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, dbConfig, storageConfig, arcaConfig],
      validationSchema,
    }),
  ],
})
export class AppConfigModule {}
