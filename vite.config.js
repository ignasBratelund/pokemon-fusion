import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages sub-path (repo name) in production,
// but stay '/' locally so `npm run dev` works at http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pokemon-fusion/' : '/',
  plugins: [react()],
}))
