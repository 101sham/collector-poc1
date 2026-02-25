import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../components/Navbar'
import { createAuthenticatedAPI } from '../services/api'

export default function MyPurchasesPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const api = createAuthenticatedAPI(getAccessTokenSilently)
    api.getMyPurchases()
      .then(({ data }) => setPurchases(data.purchases))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#1e2761] mb-6">Mes achats</h2>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Chargement...</div>
        ) : purchases.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">Vous n'avez pas encore effectué d'achats.</p>
            <Link to="/dashboard" className="bg-[#1e2761] text-white px-5 py-2.5 rounded-lg font-semibold">
              Voir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {purchases.map(p => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-5xl overflow-hidden">
                  {p.photo_url ? <img src={p.photo_url} alt={p.title} className="w-full h-full object-cover" /> : '📦'}
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">Acheté</span>
                  <h3 className="font-semibold text-[#1e2761] text-sm mt-2 line-clamp-1">{p.title}</h3>
                  <p className="text-[#1e2761] font-black text-lg">{parseFloat(p.price).toFixed(2)} €</p>
                  <p className="text-xs text-gray-400 mt-1">Vendeur : {p.seller_name || 'Anonyme'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}