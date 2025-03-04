import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: "0.0.0.0",
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@c', replacement: resolve(__dirname, 'src/components') }
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('swiper')) {
              return 'swiper';
            }
            if (id.includes('canvas-confetti')) {
              return 'canvas-confetti';
            }
            return 'vendor';
          }
          if (id.includes('/src/pages/Login') || id.includes('/src/pages/Register') ||
            id.includes('/src/pages/Questionarie') || id.includes('/src/pages/Introduction')) {
            return 'auth';
          }
          if (id.includes('/src/pages/Lifelog') || id.includes('/src/pages/LifelogDeatil') ||
            id.includes('/src/pages/UploadLife')) {
            return 'lifelog';
          }
        }
      }
    }
  }
})