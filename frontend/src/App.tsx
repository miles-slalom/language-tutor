import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Layout from './components/Layout'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, isAuthenticated, isLoading, signOut, getAccessToken, checkAuth } = useAuth()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        const token = await getAccessToken()
        setAccessToken(token)
      }
    }
    fetchToken()
  }, [isAuthenticated, getAccessToken])

  const handleAuthSuccess = () => {
    checkAuth()
  }

  const handleSignOut = async () => {
    await signOut()
    setAccessToken(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <Layout
      accessToken={accessToken}
      onSignOut={handleSignOut}
      userEmail={user?.email}
    />
  )
}

export default App
