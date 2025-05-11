import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import reactCompiler from 'babel-plugin-react-compiler'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react({
      babel: {
        plugins: [reactCompiler],
      },
    }),
  ],
})
