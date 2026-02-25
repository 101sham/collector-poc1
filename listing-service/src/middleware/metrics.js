const metrics = {
  requests_total: 0,
  requests_success: 0,
  requests_error: 0,
  listings_created: 0,
  purchases_total: 0,
  response_times: [],
}

const metricsMiddleware = (req, res, next) => {
  const start = Date.now()
  metrics.requests_total++

  res.on('finish', () => {
    const duration = Date.now() - start
    metrics.response_times.push(duration)
    if (metrics.response_times.length > 1000) metrics.response_times.shift()

    if (res.statusCode >= 400) metrics.requests_error++
    else metrics.requests_success++

    // Log structuré JSON
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      user: req.user?.id || 'anonymous',
    }))
  })
  next()
}

const getMetrics = (req, res) => {
  const times = metrics.response_times
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
  const sorted = [...times].sort((a, b) => a - b)
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0

  res.json({
    service: 'listing-service',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    requests: {
      total: metrics.requests_total,
      success: metrics.requests_success,
      error: metrics.requests_error,
      error_rate: metrics.requests_total ? (metrics.requests_error / metrics.requests_total * 100).toFixed(2) + '%' : '0%',
    },
    performance: {
      avg_response_ms: avg,
      p95_response_ms: p95,
    },
    business: {
      listings_created: metrics.listings_created,
      purchases_total: metrics.purchases_total,
    },
    memory: process.memoryUsage(),
  })
}

module.exports = { metricsMiddleware, getMetrics, metrics }