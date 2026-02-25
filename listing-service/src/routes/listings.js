const router = require('express').Router()
const { body } = require('express-validator')
const multer = require('multer')
const path = require('path')
const authenticate = require('../middleware/authenticate')
const ctrl = require('../controllers/listingController')
const { buyListing, getMyPurchases } = require('../controllers/purchaseController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? cb(null, true) : cb(new Error('Format non supporté'))
  },
})

const validateListing = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Titre : 3-200 caractères'),
  body('description').trim().notEmpty().withMessage('Description requise'),
  body('price').isFloat({ min: 0.01 }).withMessage('Prix invalide'),
  body('category').isIn(['figurines', 'cartes', 'timbres', 'monnaies', 'livres', 'vinyles', 'autres']).withMessage('Catégorie invalide'),
]

// Routes /me en premier (avant /:id sinon conflit)
router.get('/me/listings', authenticate, ctrl.getMyListings)
router.get('/me/purchases', authenticate, getMyPurchases)

// Public
router.get('/', ctrl.getListings)
router.get('/:id', ctrl.getListing)

// Authentifié
router.post('/', authenticate, upload.single('photo'), validateListing, ctrl.createListing)
router.delete('/:id', authenticate, ctrl.deleteListing)
router.post('/:id/buy', authenticate, buyListing)

module.exports = router