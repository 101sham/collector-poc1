import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../components/Navbar'
import { createAuthenticatedAPI } from '../services/api'

const CATEGORIES = ['figurines', 'cartes', 'timbres', 'monnaies', 'livres', 'vinyles', 'autres']

export default function NewListingPage() {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const errs = {}
    if (!form.title || form.title.length < 3) errs.title = 'Titre : 3 caractères minimum'
    if (!form.description.trim()) errs.description = 'Description requise'
    if (!form.price || parseFloat(form.price) <= 0) errs.price = 'Prix invalide'
    if (!form.category) errs.category = 'Sélectionnez une catégorie'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setApiError('')
    try {
      const api = createAuthenticatedAPI(getAccessTokenSilently)
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)
      await api.create(fd)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la publication')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (field) => `w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-teal-500 ${errors[field] ? 'border-red-400' : 'border-gray-200'}`

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <h2 className="text-xl font-bold text-[#1e2761]">Publier une annonce</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center">
              <label className="cursor-pointer">
                {preview
                  ? <img src={preview} alt="Aperçu" className="w-48 h-48 object-cover rounded-xl border-2 border-teal-400" />
                  : <div className="w-48 h-48 border-2 border-dashed border-gray-300 hover:border-teal-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 transition-colors">
                      <span className="text-4xl">📷</span>
                      <span className="text-sm font-medium">Ajouter une photo</span>
                    </div>
                }
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Ex: Figurine Dragon Ball Z" className={inputClass('title')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie *</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix (€) *</label>
              <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} placeholder="0.00" className={inputClass('price')} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Décrivez l'état, l'origine..." className={inputClass('description')} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {apiError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{apiError}</div>}

            <div className="flex gap-3 justify-end pt-2">
              <Link to="/dashboard" className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={saving} className="px-8 py-3 bg-[#1e2761] hover:bg-[#2e3a8a] disabled:opacity-60 text-white font-bold rounded-xl transition-colors min-w-36">
                {saving ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}