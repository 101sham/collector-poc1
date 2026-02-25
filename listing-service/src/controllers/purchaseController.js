const db = require('../models/db')

const buyListing = (req, res) => {
  const { id } = req.params
  const buyer = req.user

  const listing = db.prepare(`SELECT * FROM listings WHERE id = ? AND status = 'active'`).get(id)
  if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable ou déjà vendue' })

  if (listing.seller_id === buyer.id) {
    return res.status(400).json({ success: false, message: 'Vous ne pouvez pas acheter votre propre annonce' })
  }

  // Transaction : créer l'achat + marquer comme vendue
  const buy = db.transaction(() => {
    db.prepare(`
      INSERT INTO purchases (listing_id, buyer_id, buyer_email, price)
      VALUES (?, ?, ?, ?)
    `).run(id, buyer.id, buyer.email || '', listing.price)

    db.prepare(`UPDATE listings SET status = 'sold', updated_at = datetime('now') WHERE id = ?`).run(id)
  })

  buy()

  const { metrics } = require('../middleware/metrics')
  metrics.purchases_total++
  return res.status(201).json({
    success: true,
    message: 'Achat effectué avec succès',
    purchase: { listing_id: parseInt(id), title: listing.title, price: listing.price }
  })
}

const getMyPurchases = (req, res) => {
  const purchases = db.prepare(`
    SELECT p.*, l.title, l.category, l.photo_url, l.seller_name
    FROM purchases p
    JOIN listings l ON p.listing_id = l.id
    WHERE p.buyer_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id)

  return res.json({ success: true, purchases })
}

module.exports = { buyListing, getMyPurchases }