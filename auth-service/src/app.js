require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }))
app.use(express.json())
app.use(morgan('dev'))

app.use('/auth', require('./routes/auth'))

// Gestion erreurs JWT
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ success: false, message: 'Token invalide ou manquant' })
  }
  console.error(err)
  res.status(500).json({ success: false, message: 'Erreur interne' })
})

module.exports = app
