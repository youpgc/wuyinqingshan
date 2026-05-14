import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Netlify 部署路径
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
