import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../components/Navbar'
import { createAuthenticatedAPI } from '../services/api'

export default function ListingDetailPage() {
  const { id } = useParams()
  const { user, getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const api = createAuthenticatedAPI(getAccessTokenSilently)
    api.getListing(id)
      .then(({ data }) => setListing(data.listing))
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleBuy = async () => {
    if (!confirm(`Confirmer l'achat pour ${listing.price.toFixed(2)} € ?`)) return
    setBuying(true)
    try {
      const api = createAuthenticatedAPI(getAccessTokenSilently)
      await api.buy(id)
      setMessage({ type: 'success', text: '✅ Achat effectué ! L\'annonce est maintenant vendue.' })
      setListing(l => ({ ...l, status: 'sold' }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'achat' })
    } finally {
      setBuying(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100"><Navbar /><div className="text-center py-20 text-gray-400">Chargement...</div></div>
  if (!listing) return <div className="min-h-screen bg-gray-100"><Navbar /><div className="text-center py-20 text-gray-400">Annonce introuvable</div></div>

  const isOwner = user?.sub === listing.seller_id
  const isSold = listing.status === 'sold'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Retour</Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 gap-0">
            {/* Photo */}
            <div className="h-96 bg-gray-100 flex items-center justify-center text-8xl overflow-hidden">
              {listing.photo_url
                ? <img src={listing.photo_url} alt={listing.title} className="w-full h-full object-cover" />
                : '📦'
              }
            </div>

            {/* Infos */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{listing.category}</span>
                <h1 className="text-2xl font-black text-[#1e2761] mt-2 mb-4">{listing.title}</h1>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{listing.description}</p>
                <p className="text-sm text-gray-400">Vendeur : <span className="text-gray-700 font-medium">{listing.seller_name || listing.seller_email || 'Anonyme'}</span></p>
              </div>

              <div>
                <p className="text-4xl font-black text-[#1e2761] mb-6">{parseFloat(listing.price).toFixed(2)} €</p>

                {message && (
                  <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                  </div>
                )}

                {isSold ? (
                  <div className="bg-gray-100 text-gray-500 text-center py-4 rounded-xl font-bold text-lg">
                    VENDU
                  </div>
                ) : isOwner ? (
                  <div className="bg-blue-50 text-blue-600 text-center py-4 rounded-xl text-sm font-medium">
                    C'est votre annonce
                  </div>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-black py-4 rounded-xl text-lg transition-colors"
                  >
                    {buying ? 'Traitement...' : '🛒 Acheter maintenant'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}