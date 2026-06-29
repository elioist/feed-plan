import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '~/App';
import '~/lib/iconify/offline-icons';
import '~/styles/global.css';
import '~/lib/theme-transition/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
