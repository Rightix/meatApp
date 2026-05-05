import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // @/ → корень проекта, чтобы shadcn-компоненты (components/ui/*)
    // и утилиты (lib/utils) разрешались по алиасу из components.json
    alias: {
      // @/ → src/ — стандарт для Vite-проектов с shadcn
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Все запросы /kr-api/* Vite перенаправляет на k-ruoka.fi — без CORS.
      // Браузер видит localhost, Node.js делает реальный запрос к API.
      '/kr-api': {
        target: 'https://www.k-ruoka.fi',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,fi;q=0.8',
          'Referer': 'https://www.k-ruoka.fi/',
        }
      },
    },
  },
})
