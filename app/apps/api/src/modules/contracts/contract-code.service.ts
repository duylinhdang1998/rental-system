import { randomUUID } from 'node:crypto';
const CODE_SUFFIX_LENGTH = 8;

export function nextContractCode(): string {
  return `HD-${new Date().getUTCFullYear()}-${randomUUID().slice(0, CODE_SUFFIX_LENGTH).toUpperCase()}`;
}
