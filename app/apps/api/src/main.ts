import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';
import { ApiValidationPipe } from './common/pipes/api-validation.pipe.js';
import { loadEnvironment } from './config/configuration.js';
import type { EnvironmentInput } from './config/environment.js';

export interface ApiAppOptions {
  corsOrigins?: string[];
  demoMode?: boolean;
  environment?: EnvironmentInput;
  nodeEnv?: 'development' | 'test' | 'production';
}

function environmentOverrides(options: ApiAppOptions): EnvironmentInput {
  return {
    ...options.environment,
    ...(options.corsOrigins ? { CORS_ORIGINS: options.corsOrigins.join(',') } : {}),
    ...(options.demoMode === undefined ? {} : { DEMO_MODE: String(options.demoMode) }),
    ...(options.nodeEnv ? { NODE_ENV: options.nodeEnv } : {}),
  };
}

function configureOpenApi(application: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Rental System API')
    .setDescription('API quản lý cho thuê xe máy')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(application, options);
  SwaggerModule.setup('api/docs', application, document, {
    jsonDocumentUrl: 'api/openapi.json',
  });
}

export async function createApiApp(options: ApiAppOptions = {}): Promise<INestApplication> {
  const environment = loadEnvironment(environmentOverrides(options));
  const application = await NestFactory.create(AppModule.forRoot(environment), { logger: false });
  application.setGlobalPrefix('api');
  application.use(helmet());
  application.use(cookieParser());
  application.enableCors({ credentials: true, origin: environment.CORS_ORIGINS.split(',') });
  application.useGlobalPipes(new ApiValidationPipe());
  application.useGlobalInterceptors(new RequestContextInterceptor());
  application.useGlobalFilters(new ApiExceptionFilter());
  configureOpenApi(application);
  await application.init();
  return application;
}
