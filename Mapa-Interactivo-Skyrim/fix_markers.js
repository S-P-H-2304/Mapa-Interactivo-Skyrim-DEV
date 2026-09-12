const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const fixes = {
  'Tumulo Marcador': 'Marcador Túmulo',
  'Markath Marcador': 'Marcador Markarth',
  'Glenmoril Marcador': 'Marcador Aquelarre',
  'Ysgramor Marcador': 'Marcador Tumba',
  'Hinchado Marcador': 'Marcador Gruta'
}

Object.values(expanseData.objects).forEach(obj => {
  if (fixes[obj.name]) {
     obj.name = fixes[obj.name]
  }
})

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed marker names!')
