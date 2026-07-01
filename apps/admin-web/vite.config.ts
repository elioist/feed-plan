import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import reactScanComponentName from 'react-scan/react-component-name/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => {
  const analyzeBundle = command === 'build' && process.env.ANALYZE === 'true';
  const enableRenderDebug =
    command === 'serve' && process.env.VITE_ENABLE_RENDER_DEBUG === 'true';
  const analyzerPlugins: PluginOption[] = analyzeBundle
    ? [
        visualizer({
          filename: 'dist/stats.html',
          title: 'Feed Plan Admin Bundle',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
        }) as PluginOption,
        visualizer({
          filename: 'dist/stats.md',
          title: 'Feed Plan Admin Bundle',
          template: 'markdown',
          gzipSize: true,
          brotliSize: true,
        }) as PluginOption,
      ]
    : [];
  const renderDebugPlugins: PluginOption[] = enableRenderDebug
    ? [reactScanComponentName({}) as PluginOption]
    : [];

  return {
    plugins: [
      react({
        jsxImportSource: enableRenderDebug ? '@welldone-software/why-did-you-render' : 'react',
      }),
      tailwindcss(),
      ...renderDebugPlugins,
      ...analyzerPlugins,
    ],
    resolve: {
      alias: {
        '~': new URL('./src', import.meta.url).pathname,
      },
      dedupe: ['react', 'react-dom', 'react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
    server: {
      port: 9528,
      proxy: {
        '/api': {
          target: 'http://localhost:9527',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: 'http://localhost:9527',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
