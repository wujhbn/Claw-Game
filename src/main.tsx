/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;

window.addEventListener('error', (event) => {
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; background: white; z-index: 99999; position: relative;">
      <h2>Global Error</h2>
      <pre>${event.error?.stack || event.message}</pre>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; background: white; z-index: 99999; position: relative;">
      <h2>Unhandled Promise Rejection</h2>
      <pre>${event.reason?.stack || event.reason}</pre>
    </div>
  `;
});

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
