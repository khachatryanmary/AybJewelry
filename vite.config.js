// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-toastify'],
          galleries: [
            './src/components/RingsGallery.jsx',
            './src/components/NecklaceGallery.jsx',
            './src/components/EarringsGallery.jsx',
            './src/components/BraceletsGallery.jsx',
            './src/components/HairclipsGallery.jsx',
          ],
          admin: [
            './src/components/admin/AdminDashboard.jsx',
            './src/components/admin/ManageProducts.jsx',
            './src/components/admin/ManageCategories.jsx',
            './src/components/admin/ManageCollections.jsx',
            './src/components/admin/ManageOrders.jsx',
            './src/components/admin/ManageCustomers.jsx',
            './src/components/admin/ManageHomepageAssets.jsx',
            './src/components/admin/ManageUsers.jsx',
            './src/components/admin/AdminAnalytics.jsx',
          ],
        },
      },
    },
  },
});