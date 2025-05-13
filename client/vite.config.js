import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  esbuild: false, // Vô hiệu hóa Esbuild (SWC sẽ được sử dụng)
  resolve: {
    alias: {
      '@': '/src', // Alias cho thư mục src
    },
  },
  server: {
    port: 2000, // Đặt cổng phát triển
  },
});
