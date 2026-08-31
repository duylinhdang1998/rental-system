import { Logger } from '@nestjs/common';
import { loadEnvironment } from './config/configuration.js';
import { createApiApp } from './main.js';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const environment = loadEnvironment();
  const application = await createApiApp();
  await application.listen(environment.PORT);
}

bootstrap().catch((error: unknown) => {
  logger.error('API startup failed', error instanceof Error ? error.stack : undefined);
  process.exitCode = 1;
});
