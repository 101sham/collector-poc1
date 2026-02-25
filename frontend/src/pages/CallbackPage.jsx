import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

export default function CallbackPage() {
  const { isAuthenticated, isLoading, error } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) navigate('/dashboard', { replace: true })
      else navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Erreur : {error.message}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2761] to-teal-600 flex items-center justify-center">
      <div className="text-white text-lg">Connexion en cours...</div>
    </div>
  )
}