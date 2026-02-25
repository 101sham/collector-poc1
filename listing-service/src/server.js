const app = require('./app')
const fs = require('fs')
const PORT = process.env.PORT || 3002

// Créer les dossiers nécessaires
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
if (!fs.existsSync('data')) fs.mkdirSync('data')

app.listen(PORT, () => {
  console.log(`[listing-service] démarré sur le port ${PORT}`)
})
