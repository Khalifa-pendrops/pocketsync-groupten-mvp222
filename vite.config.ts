import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function compressionPlugin(algorithm: 'gzip' | 'brotliCompress', ext: string): Plugin {
  return {
    name: `compression-${algorithm}`,
    apply: 'build',
    closeBundle: {
      sequential: true,
      async handler() {
        const { promisify } = await import('util')
        const { readFileSync, writeFileSync } = await import('fs')
        const zlib = await import('zlib')
        const compress = algorithm === 'gzip' ? promisify(zlib.gzip) : promisify(zlib.brotliCompress)
        const glob = (await import('tinyglobby')).glob
        const files = await glob(['dist/assets/**/*.{js,css,html,svg}'])
        for (const f of files) {
          const buf = readFileSync(f)
          if (buf.length < 1024) continue
          const compressed = await compress(buf)
          writeFileSync(f + ext, compressed)
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    compressionPlugin('gzip', '.gz'),
    compressionPlugin('brotliCompress', '.br'),
  ],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor'
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) return 'redux'
          if (id.includes('node_modules/recharts')) return 'charts'
        },
      },
    },
  },
})

