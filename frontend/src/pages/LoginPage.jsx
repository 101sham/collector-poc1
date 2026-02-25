import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2761] to-teal-600 flex items-center justify-center">
      <div className="text-white text-lg">Chargement...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2761] to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-black text-[#1e2761] mb-1">
          Collector<span className="text-teal-500">.shop</span>
        </h1>
        <p className="text-gray-500 mb-8">La marketplace des collectionneurs passionnés</p>

        <div className="space-y-3 mb-8 text-left">
          {['🏆 Achetez et vendez des objets rares', '🔒 Authentification sécurisée Auth0', '⭐ Vendeurs certifiés'].map(f => (
            <div key={f} className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">{f}</div>
          ))}
        </div>

        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-[#1e2761] hover:bg-[#2e3a8a] text-white font-bold py-3.5 rounded-xl text-base transition-colors"
        >
          Se connecter avec Auth0
        </button>
        <p className="text-xs text-gray-400 mt-3">OAuth2 / OpenID Connect</p>
      </div>
    </div>
  )
}
