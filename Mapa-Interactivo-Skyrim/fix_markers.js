const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const markers = {
  'Túmulo': '0f3a3eb0-58f6-417c-a080-0072c55c600f',
  'Aquelarre': 'd8df7945-6bf4-4160-98fb-b36cbc56eb3f',
  'Tumba': '26daa6ab-8949-416d-8c69-e6ee9977eaed'
}

const fixes = {
  'Continuar Boton 2 Carrera Blanca': markers['Túmulo'],
  'Continuar Boton 3 Túmulo': markers['Aquelarre'],
  'Continuar Boton 2 Aquelarre': markers['Tumba']
}

let count = 0
Object.values(expanseData.objects).forEach(obj => {
  if (fixes[obj.name] && obj.components) {
    for (const key in obj.components) {
      if (obj.components[key].name === 'unlockLocationOnClick') {
        obj.components[key].parameters.markerToUnlock = {
          type: 'entity',
          id: fixes[obj.name]
        }
        console.log(`Corregido ${obj.name} -> apunta a ${fixes[obj.name]}`)
        count++
      }
    }
  }
})

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Se corrigieron', count, 'botones.')
