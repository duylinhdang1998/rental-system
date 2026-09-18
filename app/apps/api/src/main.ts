import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';
import { createRequestLogMiddleware } from './common/logging/request-log.middleware.js';
import {
  type LogSink,
  silentSink,
  stdoutSink,
  StructuredLogger,
} from './common/logging/structured-logger.js';
import { ApiValidationPipe } from './common/pipes/api-validation.pipe.js';
import { loadEnvironment } from './config/configuration.js';
import type { Environment, EnvironmentInput } from './config/environment.js';

export interface ApiAppOptions {
  corsOrigins?: string[];
  demoMode?: boolean;
  environment?: EnvironmentInput;
  logSink?: LogSink;
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

function configureOpenApi(application: INestApplication, environment: Environment): void {
  const options = new DocumentBuilder()
    .setTitle('Rental System API')
    .setDescription('API quản lý cho thuê xe máy')
    .setVersion(environment.APP_VERSION)
    .build();
  const document = SwaggerModule.createDocument(application, options);
  SwaggerModule.setup('api/docs', application, document, {
    jsonDocumentUrl: 'api/openapi.json',
  });
}

/** Origin hardening from the security plan: proxy trust, body limits, headers and logging. */
function hardenTransport(application: NestExpressApplication, environment: Environment): void {
  application.set('trust proxy', environment.TRUST_PROXY_HOPS);
  application.disable('x-powered-by');
  application.use(createRequestLogMiddleware(application.get(StructuredLogger)));
  application.use(helmet());
  application.useBodyParser('json', { limit: environment.BODY_LIMIT });
  application.useBodyParser('urlencoded', { extended: false, limit: environment.BODY_LIMIT });
  application.use(cookieParser());
  application.enableCors({ credentials: true, origin: environment.CORS_ORIGINS.split(',') });
}

/** Tests stay quiet unless they opt into a sink; every other environment logs JSON to stdout. */
function defaultSink(environment: Environment): LogSink {
  return environment.NODE_ENV === 'test' ? silentSink : stdoutSink;
}

export async function createApiApp(options: ApiAppOptions = {}): Promise<INestApplication> {
  const environment = loadEnvironment(environmentOverrides(options));
  const application = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot(environment, options.logSink ?? defaultSink(environment)),
    { abortOnError: false, bodyParser: false, logger: false },
  );
  application.setGlobalPrefix('api');
  hardenTransport(application, environment);
  application.useGlobalPipes(new ApiValidationPipe());
  application.useGlobalInterceptors(new RequestContextInterceptor());
  application.useGlobalFilters(new ApiExceptionFilter(application.get(StructuredLogger)));
  configureOpenApi(application, environment);
  await application.init();
  return application;
}
