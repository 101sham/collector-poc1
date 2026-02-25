const { validationResult } = require('express-validator')
const db = require('../models/db')

const CATEGORIES = ['figurines', 'cartes', 'timbres', 'monnaies', 'livres', 'vinyles', 'autres']

const getListings = (req, res) => {
  const { category, page = 1, limit = 12 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = `SELECT * FROM listings WHERE status = 'active'`
  const params = []

  if (category && CATEGORIES.includes(category)) {
    query += ` AND category = ?`
    params.push(category)
  }

  const total = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params).count
  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
  params.push(parseInt(limit), offset)

  const listings = db.prepare(query).all(...params)
  return res.json({
    success: true,
    listings,
    pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  })
}

const getListing = (req, res) => {
  const listing = db.prepare(`SELECT * FROM listings WHERE id = ? AND status = 'active'`).get(req.params.id)
  if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' })
  return res.json({ success: true, listing })
}

const getMyListings = (req, res) => {
  const listings = db.prepare(`SELECT * FROM listings WHERE seller_id = ? ORDER BY created_at DESC`).all(req.user.id)
  return res.json({ success: true, listings })
}

const createListing = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

  const { title, description, price, category } = req.body
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null

  // Fallback : utiliser email si name absent
  const sellerName = req.user.name || req.user.email || 'Vendeur'
  const sellerEmail = req.user.email || ''

  const stmt = db.prepare(`
    INSERT INTO listings (title, description, price, category, photo_url, seller_id, seller_name, seller_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    title, description, parseFloat(price), category,
    photoUrl, req.user.id, sellerName, sellerEmail
  )

  const listing = db.prepare(`SELECT * FROM listings WHERE id = ?`).get(result.lastInsertRowid)
  const { metrics } = require('../middleware/metrics')
  metrics.listings_created++
  return res.status(201).json({ success: true, message: 'Annonce publiée', listing })
}

const deleteListing = (req, res) => {
  const listing = db.prepare(`SELECT * FROM listings WHERE id = ? AND seller_id = ?`).get(req.params.id, req.user.id)
  if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable ou non autorisé' })
  db.prepare(`UPDATE listings SET status = 'archived', updated_at = datetime('now') WHERE id = ?`).run(req.params.id)
  return res.json({ success: true, message: 'Annonce supprimée' })
}

module.exports = { getListings, getListing, getMyListings, createListing, deleteListing }