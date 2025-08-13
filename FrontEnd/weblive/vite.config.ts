import { defineConfig } from 'vite'
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true // Quan trọng cho WebSocket
      },
      '/sockjs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },
  define: {
    global: 'window', // Fix "global is not defined" for sockjs-client
  },
});