import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS + vitest：用 SWC 转译以正确产出装饰器元数据（emitDecoratorMetadata），
// 同时干净处理 ESM 与 .js 扩展的源码互引。
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    root: '.',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
