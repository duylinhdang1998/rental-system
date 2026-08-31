import { type Environment, type EnvironmentInput, parseEnvironment } from './environment.js';

export const ENVIRONMENT = Symbol('ENVIRONMENT');

export function loadEnvironment(overrides: EnvironmentInput = {}): Environment {
  const processEnvironment = process.env as EnvironmentInput;
  return parseEnvironment({ ...processEnvironment, ...overrides });
}
