import globals from 'globals';
import base from './base.js';

export default [
  ...base,
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
