const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const cities = ['Carrera Blanca', 'Túmulo', 'Aquelarre', 'Tumba', 'Falkreath', 'Gruta']

let count = 0;
for (const city of cities) {
  const rumorIcon = Object.values(expanseData.objects).find(o => o.name === `Rumor ${city}`)
  if (rumorIcon && rumorIcon.ui) {
    rumorIcon.ui.top = 95
    rumorIcon.ui.left = 665
    count++
    console.log(`Actualizado: ${rumorIcon.name}`)
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Total actualizados:', count)
