import { RouterProvider, createRouter } from '@tanstack/react-router'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './global.css'

import { QueryProvider } from '@/providers/QueryProvider.tsx'
import { ThemeProvider } from '@/providers/ThemeProvider.tsx'
// Import the generated route tree
import { routeTree } from './routeTree.gen.ts'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark">
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
