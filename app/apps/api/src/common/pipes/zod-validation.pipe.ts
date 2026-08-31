import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe<Output> implements PipeTransform<unknown, Output> {
  constructor(private readonly schema: ZodType<Output>) {}

  transform(value: unknown): Output {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException('Dữ liệu gửi lên không hợp lệ');
    }
    return result.data;
  }
}
