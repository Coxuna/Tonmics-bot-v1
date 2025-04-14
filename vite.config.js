import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
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
      allowedHosts: ['uncommon-urgently-ant.ngrok-free.app'],
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      global: 'window',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    }
  }
})