const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'))

function addComponent(entity, name, params = {}) {
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

for (const city of cities) {
  if (!city.rumors) continue;
  
  const rumorPanel = Object.values(expanseData.objects).find(o => o.name === `UI Rumor ${city.name}`)
  if (!rumorPanel) continue;
  
  const rumorChildren = Object.values(expanseData.objects).filter(o => o.parentId === rumorPanel.id)
  
  const rt1 = rumorChildren.find(o => o.name === 'RumorText')
  const btnCont1 = rumorChildren.find(o => o.name === 'Continuar Boton')
  if (rt1 && btnCont1) {
    let twComp = Object.values(rt1.components || {}).find(c => c.name === 'typewriterText')
    if (!twComp) {
      const twId = addComponent(rt1, 'typewriterText')
      twComp = rt1.components[twId]
    }
    if (!twComp.parameters) twComp.parameters = {}
    twComp.parameters.enableTarget = { type: 'entity', id: btnCont1.id }
  }

  const rt2 = rumorChildren.find(o => o.name === 'RumorText 2')
  const btnCont2 = rumorChildren.find(o => o.name === 'Continuar Boton 2')
  if (rt2 && btnCont2) {
    let twComp = Object.values(rt2.components || {}).find(c => c.name === 'typewriterText')
    if (!twComp) {
      const twId = addComponent(rt2, 'typewriterText')
      twComp = rt2.components[twId]
    }
    if (!twComp.parameters) twComp.parameters = {}
    twComp.parameters.enableTarget = { type: 'entity', id: btnCont2.id }
  }

  const rt3 = rumorChildren.find(o => o.name === `RumorText 3 ${city.name}`)
  const btnCont3 = rumorChildren.find(o => o.name === `Continuar Boton 3 ${city.name}`)
  if (rt3 && btnCont3) {
    let twComp = Object.values(rt3.components || {}).find(c => c.name === 'typewriterText')
    if (!twComp) {
      const twId = addComponent(rt3, 'typewriterText')
      twComp = rt3.components[twId]
    }
    if (!twComp.parameters) twComp.parameters = {}
    twComp.parameters.enableTarget = { type: 'entity', id: btnCont3.id }
  }
}

// Add to original Carrera Blanca just in case
const cbOrigRt1 = expanseData.objects['49dd2434-2fa2-4695-a2fd-8b23819a3a28']
const cbOrigBtn1 = expanseData.objects['7299e1f7-25a8-462a-a42c-2af206a53531']
if (cbOrigRt1 && cbOrigBtn1) {
    let twComp = Object.values(cbOrigRt1.components || {}).find(c => c.name === 'typewriterText')
    if (!twComp) {
      const twId = addComponent(cbOrigRt1, 'typewriterText')
      twComp = cbOrigRt1.components[twId]
    }
    if (!twComp.parameters) twComp.parameters = {}
    twComp.parameters.enableTarget = { type: 'entity', id: cbOrigBtn1.id }
    cbOrigBtn1.disabled = true;
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed missing typewriterText components!')
