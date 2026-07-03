import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'framer-motion',
      'axios',
      'dompurify',
      'mermaid',
      'lodash',
      'date-fns',
      'jspdf',
      'jspdf-autotable',
      'react-qr-code',
      'react-to-print'
    ]
  },
  build: {
    sourcemap: false,
    cssSourcemap: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
