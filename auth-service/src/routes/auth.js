const router = require('express').Router()
const checkJwt = require('../middleware/checkJwt')
const { getMe, verifyToken, health } = require('../controllers/authController')

router.get('/health', health)
router.get('/me', checkJwt, getMe)
router.post('/verify', checkJwt, verifyToken)

module.exports = router
