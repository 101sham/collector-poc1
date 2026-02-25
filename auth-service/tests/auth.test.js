const request = require('supertest')

// Mock du middleware Auth0
jest.mock('../src/middleware/checkJwt', () => (req, res, next) => {
  req.auth = { sub: 'auth0|user123', email: 'jean@collector.shop', name: 'Jean Dupont' }
  next()
})

const app = require('../src/app')

describe('GET /auth/health', () => {
  it('retourne status ok', async () => {
    const res = await request(app).get('/auth/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('auth-service')
  })
})

describe('GET /auth/me', () => {
  it('retourne les infos utilisateur', async () => {
    const res = await request(app).get('/auth/me').set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('jean@collector.shop')
    expect(res.body.user.id).toBe('auth0|user123')
  })
})

describe('POST /auth/verify', () => {
  it('retourne les infos utilisateur du token', async () => {
    const res = await request(app).post('/auth/verify').set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user.name).toBe('Jean Dupont')
  })
})

describe('Erreur JWT', () => {
  it('retourne 401 si token invalide', async () => {
    // Démock pour tester le vrai comportement d'erreur
    jest.resetModules()
    jest.doMock('../src/middleware/checkJwt', () => (req, res, next) => {
      const err = new Error('Unauthorized')
      err.name = 'UnauthorizedError'
      next(err)
    })
    const freshApp = require('../src/app')
    const res = await request(freshApp).get('/auth/me')
    expect(res.status).toBe(401)
  })
})
