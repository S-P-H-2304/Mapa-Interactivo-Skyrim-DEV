const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'))

function addComponent(entity, name, params = {}) {
  if (!entity) return null
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

function removeComponent(entity, name) {
  if (!entity || !entity.components) return
  for (const key in entity.components) {
    if (entity.components[key].name === name) {
      delete entity.components[key]
    }
  }
}

const getSoundPath = (name) => `assets/Efectos de sonido/${name}.mp3`

function getAllDescendants(parentId) {
  let descendants = [];
  const children = Object.values(expanseData.objects).filter(o => o.parentId === parentId);
  for (const child of children) {
    descendants.push(child);
    descendants = descendants.concat(getAllDescendants(child.id));
  }
  return descendants;
}

for (const city of cities) {
  const shortNamesMap = {
    'Túmulo del Hombre de Polvo': 'Túmulo',
    'Aquelarre de Glenmoril': 'Aquelarre',
    'Tumba de Ysgramor': 'Tumba',
    'Gruta del Hombre Hinchado': 'Gruta',
    'Lucero del Alba': 'Lucero'
  }
  const shortName = shortNamesMap[city.name] || city.name
  const rumorPanel = Object.values(expanseData.objects).find(o => o.name === `UI Rumor ${shortName}`)

  if (rumorPanel && city.rumors) {
    const rumorDescendants = getAllDescendants(rumorPanel.id)
    
    // Atrás button (LibroCerrar) -> Can be called Atrás or Salir inside the rumor panel
    const atrasBtn = rumorDescendants.find(o => o.name.startsWith('Atrás') || o.name.startsWith('Salir'))
    if (atrasBtn) {
      removeComponent(atrasBtn, 'uiSoundOnClick')
      addComponent(atrasBtn, 'uiSoundOnClick', { soundFile: getSoundPath('LibroCerrar') })
    }
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed Atras/Salir sounds for Rumor UI')
