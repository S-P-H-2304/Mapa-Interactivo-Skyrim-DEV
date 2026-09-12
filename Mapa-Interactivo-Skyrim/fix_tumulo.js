const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const btn2Tumulo = Object.values(expanseData.objects).find(o => o.name === 'Continuar Boton 2 Túmulo')
const hoja1Tumulo = Object.values(expanseData.objects).find(o => o.name === 'Hoja 1 Túmulo')
const rt3Tumulo = Object.values(expanseData.objects).find(o => o.name === 'RumorText 3 Túmulo')

if (btn2Tumulo && hoja1Tumulo && rt3Tumulo) {
  const toggle = Object.values(btn2Tumulo.components).find(c => c.name === 'toggleVisibilityOnClick')
  if (toggle) {
    toggle.parameters = {
      showTarget1: { type: 'entity', id: rt3Tumulo.id },
      hideTarget1: { type: 'entity', id: hoja1Tumulo.id }
    }
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed Tumulo button 2')
