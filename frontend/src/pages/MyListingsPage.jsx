import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../components/Navbar'
import { createAuthenticatedAPI } from '../services/api'

export default function MyListingsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const api = createAuthenticatedAPI(getAccessTokenSilently)
    setLoading(true)
    api.getMine()
      .then(({ data }) => setListings(data.listings))
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return
    const api = createAuthenticatedAPI(getAccessTokenSilently)
    await api.delete(id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1e2761]">Mes annonces</h2>
          <Link to="/listings/new" className="bg-[#1e2761] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2e3a8a] transition-colors">
            + Nouvelle annonce
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Chargement...</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">Vous n'avez pas encore d'annonces.</p>
            <Link to="/listings/new" className="bg-[#1e2761] text-white px-5 py-2.5 rounded-lg font-semibold">
              Créer ma première annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {listings.map(l => (
              <div key={l.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-5xl overflow-hidden">
                  {l.photo_url ? <img src={l.photo_url} alt={l.title} className="w-full h-full object-cover" /> : '📦'}
                </div>
                <div className="p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {l.status === 'active' ? 'Active' : 'Archivée'}
                  </span>
                  <h3 className="font-semibold text-[#1e2761] text-sm mt-2 line-clamp-1">{l.title}</h3>
                  <p className="text-[#1e2761] font-black text-lg">{parseFloat(l.price).toFixed(2)} €</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleDelete(l.id)} className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}