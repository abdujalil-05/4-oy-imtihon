import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './lib/theme';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1px solid var(--hairline-strong)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
