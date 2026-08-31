import { Injectable, ValidationPipe } from '@nestjs/common';

@Injectable()
export class ApiValidationPipe extends ValidationPipe {
  constructor() {
    super({ forbidNonWhitelisted: true, transform: true, whitelist: true });
  }
}
