import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execSync } from 'child_process'

const commitSha = process.env.COMMIT_SHA || execSync('git rev-parse --short HEAD').toString().trim()

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  define: {
    __COMMIT_SHA__: JSON.stringify(commitSha),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
