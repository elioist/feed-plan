import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { loginInputSchema } from '@feed-plan/shared';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(loginInputSchema);

  it('合法输入透传并返回解析值', () => {
    const input = { username: 'chef', password: 'secret' };
    expect(pipe.transform(input)).toEqual(input);
  });

  it('缺字段抛 400', () => {
    expect(() => pipe.transform({ username: 'chef' })).toThrow(BadRequestException);
  });

  it('空用户名抛 400', () => {
    expect(() => pipe.transform({ username: '', password: 'x' })).toThrow(BadRequestException);
  });
});
