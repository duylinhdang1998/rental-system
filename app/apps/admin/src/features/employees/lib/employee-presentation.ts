import { MIN_PASSWORD_LENGTH, passwordSchema, usernameSchema } from '@rental/contracts';

export interface EmployeeIssues {
  name?: string;
  password?: string;
  username?: string;
}

/** Translation keys, not copy: the dialog renders them through i18n. */
export function passwordIssue(password: string): string | undefined {
  return passwordSchema.safeParse(password).success ? undefined : 'employeePasswordIssue';
}

export function usernameIssue(username: string): string | undefined {
  return usernameSchema.safeParse(username).success ? undefined : 'employeeUsernameIssue';
}

export function employeeFieldIssues(fields: {
  name: string;
  password: string;
  username: string;
}): EmployeeIssues {
  return {
    ...(fields.name.trim() ? {} : { name: 'employeeNameIssue' }),
    ...(passwordIssue(fields.password) ? { password: passwordIssue(fields.password) } : {}),
    ...(usernameIssue(fields.username) ? { username: usernameIssue(fields.username) } : {}),
  };
}

export function employeeTone(active: boolean): 'neutral' | 'success' {
  return active ? 'success' : 'neutral';
}

export const PASSWORD_HELP_LENGTH = MIN_PASSWORD_LENGTH;
