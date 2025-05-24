import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/recruitment-api': {
        target: 'https://pipishrimp.cn',
        changeOrigin: true,
      }
    },
    allowedHosts: ['pipishrimp.cn', 'www.pipishrimp.cn']
  }
}) 