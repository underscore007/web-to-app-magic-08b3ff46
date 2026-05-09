import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@context': resolve(__dirname, './src/context'),
      '@config': resolve(__dirname, './src/config'),
      '@services': resolve(__dirname, './src/services'),
      '@data': resolve(__dirname, './src/data'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API vers le backend Express en développement
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy Socket.io vers le backend
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
