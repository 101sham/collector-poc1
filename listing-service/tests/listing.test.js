const request = require('supertest')

// Store en mémoire simulant SQLite pour les tests
let listingsStore = []
let purchasesStore = []
let nextId = 1

const mockDb = {
  prepare: (sql) => ({
    run: (...args) => {
      if (sql.includes('INSERT INTO listings')) {
        const [title, description, price, category, photo_url, seller_id, seller_name, seller_email] = args
        const row = { id: nextId++, title, description, price, category, photo_url, seller_id, seller_name, seller_email, status: 'active', created_at: new Date().toISOString() }
        listingsStore.push(row)
        return { lastInsertRowid: row.id }
      }
      if (sql.includes('INSERT INTO purchases')) {
        const [listing_id, buyer_id, buyer_email, price] = args
        const row = { id: nextId++, listing_id, buyer_id, buyer_email, price, created_at: new Date().toISOString() }
        purchasesStore.push(row)
        return { lastInsertRowid: row.id }
      }
      if (sql.includes("status = 'sold'") || sql.includes("status = 'archived'")) {
        const id = args[0]
        listingsStore = listingsStore.map(r => r.id == id ? { ...r, status: sql.includes('sold') ? 'sold' : 'archived' } : r)
        return { changes: 1 }
      }
      if (sql.includes('UPDATE listings')) {
        listingsStore = listingsStore.map(r => r.id == args[0] ? { ...r, status: 'archived' } : r)
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    get: (...args) => {
      if (sql.includes('WHERE id = ? AND seller_id')) return listingsStore.find(r => r.id == args[0] && r.seller_id === args[1]) || null
      if (sql.includes("status = 'active'") && sql.includes('WHERE id')) return listingsStore.find(r => r.id == args[0] && r.status === 'active') || null
      if (sql.includes('WHERE id')) return listingsStore.find(r => r.id == args[0]) || null
      if (sql.includes('COUNT(*)')) {
        const cat = sql.includes('AND category') ? args[0] : null
        const count = listingsStore.filter(r => r.status === 'active' && (!cat || r.category === cat)).length
        return { count }
      }
      return null
    },
    all: (...args) => {
      if (sql.includes('purchases') && sql.includes('buyer_id')) return purchasesStore.filter(r => r.buyer_id === args[0]).map(p => ({ ...p, title: 'Test', category: 'figurines', photo_url: null, seller_name: 'Vendeur' }))
      if (sql.includes('seller_id = ?')) return listingsStore.filter(r => r.seller_id === args[0])
      if (sql.includes('AND category')) {
        const [cat, limit, offset] = args
        return listingsStore.filter(r => r.status === 'active' && r.category === cat).slice(offset, offset + limit)
      }
      const [limit, offset] = args.slice(-2)
      return listingsStore.filter(r => r.status === 'active').slice(offset, offset + limit)
    },
  }),
  transaction: (fn) => fn,
  exec: () => {},
  pragma: () => {},
}

jest.mock('../src/models/db', () => mockDb)

jest.mock('../src/middleware/authenticate', () => (req, res, next) => {
  req.user = { id: 'auth0|user123', name: 'Jean Dupont', email: 'jean@collector.shop' }
  next()
})

beforeEach(() => { listingsStore = []; purchasesStore = []; nextId = 1 })

const app = require('../src/app')

describe('GET /health', () => {
  it('retourne status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('GET /metrics', () => {
  it('retourne les métriques du service', async () => {
    const res = await request(app).get('/metrics')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('listing-service')
    expect(res.body.requests).toBeDefined()
    expect(res.body.performance).toBeDefined()
    expect(res.body.business).toBeDefined()
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

  it('retourne une annonce existante', async () => {
    await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Figurine Dragon Ball', description: 'Très bon état', price: 45, category: 'figurines' })
    const res = await request(app).get('/listings/1')
    expect(res.status).toBe(200)
    expect(res.body.listing.title).toBe('Figurine Dragon Ball')
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

describe('DELETE /listings/:id', () => {
  it('supprime une annonce du user', async () => {
    await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Figurine Dragon Ball', description: 'Très bon état', price: 45, category: 'figurines' })
    const res = await request(app)
      .delete('/listings/1')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('retourne 404 si annonce inexistante ou pas au user', async () => {
    const res = await request(app)
      .delete('/listings/9999')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(404)
  })
})

describe('POST /listings/:id/buy', () => {
  it('achète une annonce d\'un autre vendeur', async () => {
    listingsStore.push({
      id: 99, title: 'Carte rare', description: 'desc', price: 50,
      category: 'cartes', photo_url: null, seller_id: 'auth0|other',
      seller_name: 'Autre', seller_email: 'other@test.com', status: 'active',
      created_at: new Date().toISOString()
    })
    const res = await request(app)
      .post('/listings/99/buy')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('refuse d\'acheter sa propre annonce', async () => {
    await request(app)
      .post('/listings')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Ma figurine', description: 'desc', price: 10, category: 'figurines' })
    const res = await request(app)
      .post('/listings/1/buy')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(400)
  })

  it('retourne 404 si annonce inexistante', async () => {
    const res = await request(app)
      .post('/listings/9999/buy')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(404)
  })
})

describe('GET /listings/me/purchases', () => {
  it('retourne les achats du user', async () => {
    const res = await request(app)
      .get('/listings/me/purchases')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.purchases)).toBe(true)
  })
})