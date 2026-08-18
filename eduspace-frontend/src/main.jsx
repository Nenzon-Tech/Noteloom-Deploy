import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App.jsx'
import '@/index.css'
import { API_BASE } from '@/utils/config';

// 🌐 Global Fetch Interceptor for Secure Cookie Transmission
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    url = input.url;
  }

  // If request matches backend base URL or backend paths, attach credentials (cookies)
  if (url && (url.startsWith(API_BASE) || url.startsWith('/api') || url.startsWith('/session') || url.startsWith('/it-') || url.startsWith('/health'))) {
    init.credentials = 'include';
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
)
