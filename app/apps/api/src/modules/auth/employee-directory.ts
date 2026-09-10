import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';

/** Resolves account ids to display names so ledgers and reports never expose raw ids. */
@Injectable()
export class EmployeeDirectory {
  constructor(private readonly accounts: AuthRepository) {}

  async names(ids: Iterable<string>): Promise<Map<string, string>> {
    const unique = [...new Set(ids)];
    const accounts = await Promise.all(unique.map((id) => this.accounts.findAccountById(id)));
    return new Map(
      unique.map((id, index) => [id, accounts[index]?.name ?? id] satisfies [string, string]),
    );
  }
}
