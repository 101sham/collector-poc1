const request = require('supertest')

// Store en mémoire simulant SQLite pour les tests
let store = []
let nextId = 1

const mockDb = {
  prepare: (sql) => ({
    run: (...args) => {
      if (sql.includes('INSERT INTO listings')) {
        const [title, description, price, category, photo_url, seller_id, seller_name, seller_email] = args
        const row = { id: nextId++, title, description, price, category, photo_url, seller_id, seller_name, seller_email, status: 'active', created_at: new Date().toISOString() }
        store.push(row)
        return { lastInsertRowid: row.id }
      }
      if (sql.includes('UPDATE listings')) {
        store = store.map(r => r.id == args[0] ? { ...r, status: 'archived' } : r)
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    get: (...args) => {
      if (sql.includes('WHERE id = ? AND seller_id')) return store.find(r => r.id == args[0] && r.seller_id === args[1]) || null
      if (sql.includes("status = 'active'") && sql.includes('WHERE id')) return store.find(r => r.id == args[0] && r.status === 'active') || null
      if (sql.includes('WHERE id')) return store.find(r => r.id == args[0]) || null
      if (sql.includes('COUNT(*)')) {
        const cat = sql.includes('AND category') ? args[0] : null
        const count = store.filter(r => r.status === 'active' && (!cat || r.category === cat)).length
        return { count }
      }
      return null
    },
    all: (...args) => {
      if (sql.includes('seller_id = ?')) return store.filter(r => r.seller_id === args[0])
      if (sql.includes('AND category')) {
        const [cat, limit, offset] = args
        return store.filter(r => r.status === 'active' && r.category === cat).slice(offset, offset + limit)
      }
      const [limit, offset] = args.slice(-2)
      return store.filter(r => r.status === 'active').slice(offset, offset + limit)
    },
  }),
  exec: () => {},
  pragma: () => {},
}

jest.mock('../src/models/db', () => mockDb)

// Mock authenticate middleware
jest.mock('../src/middleware/authenticate', () => (req, res, next) => {
  req.user = { id: 'auth0|user123', name: 'Jean Dupont', email: 'jean@collector.shop' }
  next()
})

beforeEach(() => { store = []; nextId = 1 })

const app = require('../src/app')

describe('GET /health', () => {
  it('retourne status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('GET /listings', () => {
  it('retourne une liste vide au départ', async () => {
    const res = await request(app).get('/listings')
    expect(res.status).toBe(200)
    expect(res.body.listings).toEqual([])
    expect(res.body.pagination.total).toBe(0)
  })
})

describe('POST /listings', () => {
  it('crée une annonce valide', async () => {
    const res = await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Figurine Dragon Ball', description: 'Très bon état', price: 45, category: 'figurines' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('rejette un titre trop court', async () => {
    const res = await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'AB', description: 'desc', price: 10, category: 'figurines' })
    expect(res.status).toBe(400)
  })

  it('rejette une catégorie invalide', async () => {
    const res = await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Mon objet', description: 'desc', price: 10, category: 'invalid' })
    expect(res.status).toBe(400)
  })

  it('rejette un prix négatif', async () => {
    const res = await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Mon objet', description: 'desc', price: -5, category: 'figurines' })
    expect(res.status).toBe(400)
  })
})

describe('GET /listings/:id', () => {
  it('retourne 404 si annonce inexistante', async () => {
    const res = await request(app).get('/listings/9999')
    expect(res.status).toBe(404)
  })
})

describe('GET /listings/me/listings', () => {
  it('retourne les annonces du user connecté', async () => {
    const res = await request(app)
      .get('/listings/me/listings')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.listings)).toBe(true)
  })
})
