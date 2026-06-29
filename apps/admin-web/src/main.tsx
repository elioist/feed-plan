import React from 'react';
import '~/lib/iconify/offline-icons';
import '~/styles/global.css';
import '~/lib/theme-transition/styles.css';

async function enableRenderDebug() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_RENDER_DEBUG !== 'true') return;
  await import('~/lib/debug/render-instrumentation');
}

async function bootstrap() {
  await enableRenderDebug();

  const [ReactDOM, { App }] = await Promise.all([
    import('react-dom/client'),
    import('~/App'),
  ]);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    React.createElement(React.StrictMode, null, React.createElement(App)),
  );
}

void bootstrap();
