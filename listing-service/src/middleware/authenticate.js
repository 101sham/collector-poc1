const axios = require('axios')

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant' })
  }

  try {
    const { data } = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/auth/verify`,
      {},
      { headers: { Authorization: authHeader }, timeout: 5000 }
    )
    req.user = data.user
    next()
  } catch (err) {
    const status = err.response?.status || 401
    const message = err.response?.data?.message || 'Token invalide'
    return res.status(status).json({ success: false, message })
  }
}

module.exports = authenticate
