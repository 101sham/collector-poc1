const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')
const { metricsMiddleware, getMetrics } = require('./middleware/metrics')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(metricsMiddleware)

// Health + Metrics
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'listing-service' }))
app.get('/metrics', getMetrics)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
const listingsRouter = require('./routes/listings')
app.use('/listings', listingsRouter)

module.exports = app