import { type DynamicModule, Global, Module } from '@nestjs/common';
import { LOG_SINK, type LogSink, StructuredLogger, stdoutSink } from './structured-logger.js';

@Global()
@Module({})
export class LoggingModule {
  static register(sink: LogSink = stdoutSink): DynamicModule {
    return {
      exports: [StructuredLogger],
      module: LoggingModule,
      providers: [{ provide: LOG_SINK, useValue: sink }, StructuredLogger],
    };
  }
}
