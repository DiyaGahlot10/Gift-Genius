import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#292533',
            borderRadius: '9999px',
            boxShadow: '0 12px 36px -10px rgba(85, 60, 110, 0.22)',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
