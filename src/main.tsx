import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import { queryClient } from './data/store/queryClient';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: { background: '#1A2722', border: '1px solid #26362F', color: '#F2F7F4' },
          }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
