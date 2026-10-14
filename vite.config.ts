import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: process.env.BASE_PATH ?? '/ronan/',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
