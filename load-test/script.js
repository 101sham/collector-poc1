import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const listingDuration = new Trend('listing_duration')

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Montée en charge : 0 → 10 users
    { duration: '1m',  target: 50 },  // Charge nominale : 50 users
    { duration: '30s', target: 100 }, // Pic de charge : 100 users
    { duration: '30s', target: 0 },   // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],  // KPI : p95 < 300ms
    errors: ['rate<0.05'],              // Taux d'erreur < 5%
  },
}

const BASE_URL = 'https://localhost:8443'

export default function () {
  // Test 1 : GET /api/listings
  const listingsRes = http.get(`${BASE_URL}/api/listings`, {
    insecureSkipTLSVerify: true,
  })

  check(listingsRes, {
    'listings status 200': (r) => r.status === 200,
    'listings response < 300ms': (r) => r.timings.duration < 300,
  })

  listingDuration.add(listingsRes.timings.duration)
  errorRate.add(listingsRes.status !== 200)

  sleep(1)

  // Test 2 : GET /health
  const healthRes = http.get(`${BASE_URL}/api/auth/health`, {
    insecureSkipTLSVerify: true,
  })

  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  })

  errorRate.add(healthRes.status !== 200)

  sleep(0.5)
}