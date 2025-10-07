import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // index.css imports src/styles/theme.css -> tokens
import App from './App';
import { AppProvider } from './state/AppContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
