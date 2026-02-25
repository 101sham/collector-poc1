import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../components/Navbar'
import { createAuthenticatedAPI } from '../services/api'

const CATEGORIES = [
  { id: 'figurines', emoji: '🗿' },
  { id: 'cartes', emoji: '🃏' },
  { id: 'timbres', emoji: '📮' },
  { id: 'monnaies', emoji: '🪙' },
  { id: 'livres', emoji: '📚' },
  { id: 'vinyles', emoji: '🎵' },
  { id: 'autres', emoji: '📦' },
]

export default function DashboardPage() {
  const { user, getAccessTokenSilently } = useAuth0()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    const api = createAuthenticatedAPI(getAccessTokenSilently)
    setLoading(true)
    api.getListings({ category, limit: 9 })
      .then(({ data }) => setListings(data.listings))
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [category, getAccessTokenSilently])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-gradient-to-r from-[#1e2761] to-teal-600 rounded-2xl p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Bonjour, <span className="text-teal-300">{user?.given_name || user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/70">Découvrez les dernières annonces ou publiez vos objets de collection.</p>
          </div>
          <Link to="/listings/new" className="bg-white text-[#1e2761] font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform hidden sm:block">
            + Publier
          </Link>
        </div>

        <section>
          <h2 className="text-lg font-bold text-[#1e2761] mb-3">Catégories</h2>
          <div className="grid grid-cols-7 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? null : cat.id)}
                className={`rounded-xl p-3 flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                  category === cat.id ? 'bg-[#1e2761] text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="capitalize">{cat.id}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1e2761]">
              {category ? `Catégorie : ${category}` : 'Dernières annonces'}
            </h2>
            {category && <button onClick={() => setCategory(null)} className="text-sm text-teal-600 hover:underline">Tout voir</button>}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-16">Chargement...</div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-400 mb-4">Aucune annonce pour le moment.</p>
              <Link to="/listings/new" className="bg-[#1e2761] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#2e3a8a] transition-colors">
                Publier la première annonce
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {listings.map(l => (
                <Link key={l.id} to={`/listings/${l.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="h-44 bg-gray-100 flex items-center justify-center text-5xl overflow-hidden">
                    {l.photo_url ? <img src={l.photo_url} alt={l.title} className="w-full h-full object-cover" /> : '📦'}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-teal-600 font-semibold uppercase">{l.category}</span>
                    <h3 className="font-semibold text-[#1e2761] text-sm mt-1 line-clamp-2">{l.title}</h3>
                    <p className="text-[#1e2761] font-black text-lg mt-2">{parseFloat(l.price).toFixed(2)} €</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}