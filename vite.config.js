import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const require = createRequire(import.meta.url)
const { handleDictionary } = require('./functions/dictionary.js')

// Local stand-in for the Hosting rewrite to the `dictionary` function.
// Callable Functions are pinned to the emulator in dev, and that emulator is
// not part of `npm run dev`, so the dictionary route is served here instead.
function dictionaryApi() {
  return {
    name: 'dictionary-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/dictionary/')) {
          next()
          return
        }

        try {
          const result = await handleDictionary(url)
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(result.body))
        } catch (error) {
          console.error('Dictionary dev route failed:', error)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Lookup failed' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [dictionaryApi(), react(), tailwindcss()],
})
