// GET /auth/me — retourne les infos du user connecté (token déjà validé par le middleware)
const getMe = (req, res) => {
  const { sub, email, name, picture } = req.auth
  return res.json({
    success: true,
    user: { id: sub, email, name, picture },
  })
}

// POST /auth/verify — vérifie un token (appelé par les autres services)
const verifyToken = (req, res) => {
  const { sub, email, name } = req.auth
  return res.json({
    success: true,
    user: { id: sub, email, name },
  })
}

// GET /health
const health = (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', ts: new Date().toISOString() })
}

module.exports = { getMe, verifyToken, health }
