import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand', 'lucide-react', 'konva', 'react-konva'],
        },
      },
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
});
