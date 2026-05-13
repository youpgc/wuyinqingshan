import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wuyinqingshan/', // GitHub Pages 部署路径 - 雾隐青山
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
