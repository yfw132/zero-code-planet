import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // server: {
  //   proxy: {
  //    '/back': {
  //       target: `http://119.45.93.228:8886`, 
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/back/, "")
  //     }
  //   }
  // },
})
