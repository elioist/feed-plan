import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType, ZodTypeDef } from 'zod';

/**
 * 基于 Zod 的请求体校验管道。
 * 与全仓共享的 Zod schema 配合：校验失败抛 400 并附带字段级错误。
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T, ZodTypeDef, unknown>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: '请求参数校验失败',
        errors: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}
