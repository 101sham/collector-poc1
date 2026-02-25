import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Navbar() {
  const { user, logout } = useAuth0()

  return (
    <nav className="bg-[#1e2761] sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/dashboard" className="text-white font-black text-lg">
          Collector<span className="text-teal-400">.shop</span>
        </Link>

        <div className="flex gap-1 flex-1">
          {[
            { to: '/dashboard', label: 'Accueil' },
            { to: '/listings/new', label: 'Publier' },
            { to: '/my-listings', label: 'Mes annonces' },
            { to: '/my-purchases', label: 'Mes achats' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md text-sm font-medium transition-all">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-teal-400" />
            : <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || '?'}
              </div>
          }
          <span className="text-blue-200 text-sm hidden sm:block">{user?.name}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="text-white/70 border border-white/25 hover:bg-white/10 px-3 py-1.5 rounded-md text-sm transition-all"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}