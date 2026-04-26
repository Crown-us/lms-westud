import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './components/auth-provider'
import { Toaster } from './components/ui/toaster'

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // This will be set in the App component
    queryClient,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuth()
  return (
    <>
      <RouterProvider router={router} context={{ auth, queryClient }} />
      <Toaster />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
