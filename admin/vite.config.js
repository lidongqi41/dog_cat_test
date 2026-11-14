import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    watch: {
      // Windows 下 Vite 会把临时配置目录也纳入监听，导致 EBUSY
      ignored: ['**/.vite.config.js.*.tmpdir/**', '**/*.tmp']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})