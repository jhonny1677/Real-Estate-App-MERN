import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // 🔁 Proxy all API requests to your backend
      '/api': {
        target: 'http://localhost:8800', // 🟢 Make sure this is your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // Make process.env available for any legacy code that might need it
    'process.env': {},
  },
});
