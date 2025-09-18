// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('axios') || id.includes('react-toastify')) {
              return 'vendor';
            }
          }

          // Gallery components chunk
          if (id.includes('Gallery.jsx')) {
            return 'galleries';
          }

          // Admin components chunk
          if (id.includes('/admin/')) {
            return 'admin';
          }
        },
      },
    },
  },
});