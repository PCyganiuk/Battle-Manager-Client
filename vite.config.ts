import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensures the build folder is named 'dist'
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Split vendor dependencies for caching
        },
      },
    },
  },
})
