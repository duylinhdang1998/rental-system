import { Inject, Injectable } from '@nestjs/common';

export type LogLevel = 'error' | 'info' | 'warn';
export type LogSink = (line: string) => void;
export const LOG_SINK = Symbol('LOG_SINK');

export interface LogEntry {
  [field: string]: unknown;
  event: string;
  level?: LogLevel;
}

const SENSITIVE_KEY = /authorization|cookie|csrf|hash|password|secret|token/i;
const MAX_DEPTH = 4;
const REDACTED = '[REDACTED]';

/** Masks any field whose name suggests a credential, at any depth, before serialization. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return REDACTED;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value instanceof Error) return { message: value.message, name: value.name };
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, field]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : redact(field, depth + 1),
    ]),
  );
}

export const silentSink: LogSink = () => undefined;

export const stdoutSink: LogSink = (line) => {
  process.stdout.write(line);
};

/** One JSON object per line so the platform log shipper can index every field. */
@Injectable()
export class StructuredLogger {
  constructor(@Inject(LOG_SINK) private readonly sink: LogSink) {}

  log(entry: LogEntry): void {
    const { level = 'info', ...fields } = entry;
    const line = JSON.stringify({ at: new Date().toISOString(), level, ...redactedFields(fields) });
    this.sink(`${line}\n`);
  }
}

function redactedFields(fields: Record<string, unknown>): Record<string, unknown> {
  return redact(fields) as Record<string, unknown>;
}
