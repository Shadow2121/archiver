// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@aws-amplify/api',
      '@aws-amplify/auth',
      '@aws-amplify/ui-react',
      'aws-amplify'
    ]
  }
});