import axios from 'axios'

const getBaseURL = () => `${window.location.protocol}//${window.location.host}/api`

export const createAuthenticatedAPI = (getAccessTokenSilently) => {
  const authApi = axios.create({ baseURL: getBaseURL(), timeout: 10000 })

  authApi.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently()
      config.headers.Authorization = `Bearer ${token}`
    } catch (e) {
      console.error('Token error', e)
    }
    return config
  })

  return {
    getListings: (params) => authApi.get('/listings', { params }),
    getListing: (id) => authApi.get(`/listings/${id}`),
    getMine: () => authApi.get('/listings/me/listings'),
    create: (formData) => authApi.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => authApi.delete(`/listings/${id}`),
    buy: (id) => authApi.post(`/listings/${id}/buy`),
    getMyPurchases: () => authApi.get('/listings/me/purchases'),
  }
}

export default axios.create({ baseURL: getBaseURL(), timeout: 10000 })