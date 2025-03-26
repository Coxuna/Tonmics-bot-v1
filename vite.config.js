import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
    },
    server: {
      fs: {
        allow: ['./'],
      },
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL), // Example usage
    },
  }
})
