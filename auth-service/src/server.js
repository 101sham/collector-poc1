const app = require('./app')
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`[auth-service] démarré sur le port ${PORT}`)
})
