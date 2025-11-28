
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.ts
export default defineConfig({
  base: './', // 关键：设置为相对路径，支持离线打开 index.html
  plugins: [react()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp', '**/*.svg'],
  publicDir: 'public', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});
