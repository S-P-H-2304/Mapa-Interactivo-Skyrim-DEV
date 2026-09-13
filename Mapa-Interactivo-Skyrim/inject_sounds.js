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

// Get all descendants to easily find buttons
function getAllDescendants(parentId) {
  let descendants = [];
  const children = Object.values(expanseData.objects).filter(o => o.parentId === parentId);
  for (const child of children) {
    descendants.push(child);
    descendants = descendants.concat(getAllDescendants(child.id));
  }
  return descendants;
}

// 1. Boton Empezar
const empezarBtn = Object.values(expanseData.objects).find(o => o.name === 'Empezar Boton')
if (empezarBtn) {
  removeComponent(empezarBtn, 'uiSoundOnClick')
  addComponent(empezarBtn, 'uiSoundOnClick', { soundFile: getSoundPath('UIEntrar') })
}

// 2. Audio Controls
['Sound Mute Toggle', 'Sound Up', 'Sound Down'].forEach(name => {
  const btn = Object.values(expanseData.objects).find(o => o.name === name)
  if (btn) {
    removeComponent(btn, 'uiSoundOnClick')
    addComponent(btn, 'uiSoundOnClick', { soundFile: getSoundPath('UISonido') })
  }
})

// 3. UI Panels
for (const city of cities) {
  const shortNamesMap = {
    'Túmulo del Hombre de Polvo': 'Túmulo',
    'Aquelarre de Glenmoril': 'Aquelarre',
    'Tumba de Ysgramor': 'Tumba',
    'Gruta del Hombre Hinchado': 'Gruta',
    'Lucero del Alba': 'Lucero'
  }
  const shortName = shortNamesMap[city.name] || city.name

  const ubiPanel = Object.values(expanseData.objects).find(o => o.name === `UI Ubicación ${shortName}`)
  const rumorPanel = Object.values(expanseData.objects).find(o => o.name === `UI Rumor ${shortName}`)

  if (ubiPanel) {
    const ubiDescendants = getAllDescendants(ubiPanel.id)
    
    // Wiki button
    const wikiBtn = ubiDescendants.find(o => o.name.startsWith('Wiki'))
    if (wikiBtn) {
      removeComponent(wikiBtn, 'uiSoundOnClick')
      addComponent(wikiBtn, 'uiSoundOnClick', { soundFile: getSoundPath('UIEntrar') })
    }

    // Rumor button (LibroAbrir)
    const rumorBtn = ubiDescendants.find(o => o.name.startsWith('Rumor '))
    if (rumorBtn) {
      removeComponent(rumorBtn, 'uiSoundOnClick')
      addComponent(rumorBtn, 'uiSoundOnClick', { soundFile: getSoundPath('LibroAbrir') })
    }

    // Salir button (UISalir)
    const salirBtn = ubiDescendants.find(o => o.name.startsWith('Salir'))
    if (salirBtn) {
      removeComponent(salirBtn, 'uiSoundOnClick')
      addComponent(salirBtn, 'uiSoundOnClick', { soundFile: getSoundPath('UISalir') })
    }
  }

  if (rumorPanel && city.rumors) {
    const rumorDescendants = getAllDescendants(rumorPanel.id)
    
    // Atrás button (LibroCerrar)
    const atrasBtn = rumorDescendants.find(o => o.name.startsWith('Atrás'))
    if (atrasBtn) {
      removeComponent(atrasBtn, 'uiSoundOnClick')
      addComponent(atrasBtn, 'uiSoundOnClick', { soundFile: getSoundPath('LibroCerrar') })
    }

    // Continuar buttons
    const btn1 = rumorDescendants.find(o => o.name.startsWith('Continuar Boton') && !o.name.includes(' 2') && !o.name.includes(' 3') && !o.name.includes(' 4'))
    const btn2 = rumorDescendants.find(o => o.name.startsWith('Continuar Boton 2'))
    const btn3 = rumorDescendants.find(o => o.name.startsWith('Continuar Boton 3'))
    const btn4 = rumorDescendants.find(o => o.name.startsWith('Continuar Boton 4'))

    const len = city.rumors.length

    // Helper to apply sound
    const applyBtnSound = (btn, index) => {
      if (!btn) return
      removeComponent(btn, 'uiSoundOnClick')
      
      const isFinal = index === len
      
      let sound = 'UIEntrar' // Default
      
      if (isFinal) {
         if (shortName === 'Tumba' || shortName === 'Gruta') {
            sound = 'MisionCompletada'
         } else {
            sound = 'LocalizacionNueva'
         }
      } else {
         // Is it a page change?
         // In Falkreath, btn2 changes from Hoja 1 to Hoja 2
         // In Tumulo, btn2 changes from Hoja 1 to page 3
         if ((shortName === 'Falkreath' || shortName === 'Túmulo') && index === 2) {
            sound = 'LibroPagina'
         } else {
            sound = 'UIEntrar'
         }
      }
      
      addComponent(btn, 'uiSoundOnClick', { soundFile: getSoundPath(sound) })
    }

    applyBtnSound(btn1, 1)
    applyBtnSound(btn2, 2)
    applyBtnSound(btn3, 3)
    applyBtnSound(btn4, 4)
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Successfully injected uiSoundOnClick components!')
