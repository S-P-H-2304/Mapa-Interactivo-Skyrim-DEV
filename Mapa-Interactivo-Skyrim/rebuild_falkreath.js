const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'))

const bgFrameId = '473c7055-07c6-433b-b166-03684ad7a490'
const newLocPanelId = '57300f21-0ba5-4056-bd67-6fd11acbc745'
const newLocNameId = '02257a0f-f15f-4661-ad15-2f6ea61b47a9'
const newLocImageId = '00dcd921-eff0-463b-89f0-3ea9f9e4ffa7'

function getMarkerForCity(cityName) {
  const m = Object.values(expanseData.objects).find(o => o.name.includes(cityName) && o.name.includes('Marcador'))
  if (!m) {
     const words = cityName.split(' ')
     for (const word of words) {
        if (word.length > 3) {
            const m2 = Object.values(expanseData.objects).find(o => o.name.includes(word) && o.name.includes('Marcador'))
            if (m2) return m2
        }
     }
  }
  return m
}

function addComponent(entity, name, params = {}) {
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

function cloneNodeFlat(nodeToClone) {
  const newObj = JSON.parse(JSON.stringify(nodeToClone))
  newObj.id = uuid()
  newObj.components = {}
  return newObj
}

// Ensure Hoja empty element
function createHoja(name, parentId, disabled = false) {
  const h = {
    id: uuid(),
    parentId: parentId,
    name: name,
    components: {},
    ui: { type: '3d' },
    transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] },
    disabled: disabled
  }
  expanseData.objects[h.id] = h
  return h
}

function rebuildFalkreath() {
  const rumorPanel = Object.values(expanseData.objects).find(o => o.name === 'UI Rumor Falkreath')
  const falkData = cities.find(c => c.name === 'Falkreath')
  
  // Find old text/btn templates from the existing panel before we clear it
  const oldChildren = Object.values(expanseData.objects).filter(o => o.parentId === rumorPanel.id)
  const tplText = oldChildren.find(o => o.name.startsWith('RumorText'))
  const tplBtn = oldChildren.find(o => o.name.startsWith('Continuar Boton'))
  const btnChildTpl = Object.values(expanseData.objects).find(o => o.parentId === tplBtn.id)

  // Wipe old elements EXCEPT Atrás, Título, Libro
  oldChildren.forEach(c => {
    if (c.name.startsWith('RumorText') || c.name.startsWith('Continuar Boton') || c.name.startsWith('Hoja')) {
      delete expanseData.objects[c.id]
      Object.values(expanseData.objects).filter(gc => gc.parentId === c.id).forEach(gc => delete expanseData.objects[gc.id])
    }
  })

  // Create Hoja 1 and Hoja 2
  const hoja1 = createHoja('Hoja 1 Falkreath', rumorPanel.id, false)
  const hoja2 = createHoja('Hoja 2 Falkreath', rumorPanel.id, true)

  // PAGE 1
  const rt1 = cloneNodeFlat(tplText)
  rt1.parentId = hoja1.id
  rt1.name = 'RumorText Falkreath'
  rt1.ui.text = falkData.rumors[0].text
  rt1.disabled = false

  const btn1 = cloneNodeFlat(tplBtn)
  btn1.parentId = hoja1.id
  btn1.name = 'Continuar Boton Falkreath'
  btn1.disabled = true
  const btn1Text = cloneNodeFlat(btnChildTpl)
  btn1Text.parentId = btn1.id
  btn1Text.name = 'Text Continuar Boton Falkreath'
  btn1Text.ui.text = falkData.rumors[0].btnText
  
  addComponent(rt1, 'typewriterText', { enableTarget: { type: 'entity', id: btn1.id } })

  // PAGE 2
  const rt2 = cloneNodeFlat(tplText)
  rt2.parentId = hoja1.id
  rt2.name = 'RumorText 2 Falkreath'
  rt2.ui.text = falkData.rumors[1].text
  rt2.disabled = true

  const btn2 = cloneNodeFlat(tplBtn)
  btn2.parentId = hoja1.id
  btn2.name = 'Continuar Boton 2 Falkreath'
  btn2.disabled = true
  // Adjust position of btn2 visually below rt2
  btn2.ui.top = rt2.ui.top + rt2.ui.height + 20
  
  const btn2Text = cloneNodeFlat(btnChildTpl)
  btn2Text.parentId = btn2.id
  btn2Text.name = 'Text Continuar Boton 2 Falkreath'
  btn2Text.ui.text = falkData.rumors[1].btnText

  addComponent(rt2, 'typewriterText', { enableTarget: { type: 'entity', id: btn2.id } })
  addComponent(btn1, 'toggleVisibilityOnClick', {
    showTarget1: { type: 'entity', id: rt2.id },
    hideTarget1: { type: 'entity', id: btn1.id }
  })
  addComponent(btn1, 'pressHoldFeedback', {})

  // PAGE 3 (Inside Hoja 2)
  const rt3 = cloneNodeFlat(tplText)
  rt3.parentId = hoja2.id
  rt3.name = 'RumorText 3 Falkreath'
  rt3.ui.text = falkData.rumors[2].text
  rt3.disabled = false // Active when Hoja 2 becomes active

  const btn3 = cloneNodeFlat(tplBtn)
  btn3.parentId = hoja2.id
  btn3.name = 'Continuar Boton 3 Falkreath'
  btn3.disabled = true
  
  const btn3Text = cloneNodeFlat(btnChildTpl)
  btn3Text.parentId = btn3.id
  btn3Text.name = 'Text Continuar Boton 3 Falkreath'
  btn3Text.ui.text = falkData.rumors[2].btnText

  addComponent(rt3, 'typewriterText', { enableTarget: { type: 'entity', id: btn3.id } })
  addComponent(btn2, 'toggleVisibilityOnClick', {
    showTarget1: { type: 'entity', id: hoja2.id },
    hideTarget1: { type: 'entity', id: hoja1.id }
  })
  addComponent(btn2, 'pressHoldFeedback', {})

  // PAGE 4 (Inside Hoja 2)
  const rt4 = cloneNodeFlat(tplText)
  rt4.parentId = hoja2.id
  rt4.name = 'RumorText 4 Falkreath'
  rt4.ui.text = falkData.rumors[3].text
  rt4.disabled = true

  const btn4 = cloneNodeFlat(tplBtn)
  btn4.parentId = hoja2.id
  btn4.name = 'Continuar Boton 4 Falkreath'
  btn4.disabled = true
  btn4.ui.top = rt4.ui.top + rt4.ui.height + 20
  
  const btn4Text = cloneNodeFlat(btnChildTpl)
  btn4Text.parentId = btn4.id
  btn4Text.name = 'Text Continuar Boton 4 Falkreath'
  btn4Text.ui.text = falkData.rumors[3].btnText

  addComponent(rt4, 'typewriterText', { enableTarget: { type: 'entity', id: btn4.id } })
  addComponent(btn3, 'toggleVisibilityOnClick', {
    showTarget1: { type: 'entity', id: rt4.id },
    hideTarget1: { type: 'entity', id: btn3.id }
  })
  addComponent(btn3, 'pressHoldFeedback', {})

  const r4 = falkData.rumors[3]
  addComponent(btn4, 'unlockLocationOnClick', {
    panelToHide: { type: 'entity', id: rumorPanel.id },
    backgroundFrame: { type: 'entity', id: bgFrameId },
    uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
    imageElement: { type: 'entity', id: newLocImageId },
    nameElement: { type: 'entity', id: newLocNameId },
    imageSrc: r4.unlockLocation.image,
    locationName: r4.unlockLocation.name,
    markerToUnlock: { type: 'entity', id: getMarkerForCity(r4.unlockLocation.markerName).id }
  })
  addComponent(btn4, 'pressHoldFeedback', {})

  // Insert to DB
  expanseData.objects[rt1.id] = rt1
  expanseData.objects[btn1.id] = btn1
  expanseData.objects[btn1Text.id] = btn1Text
  expanseData.objects[rt2.id] = rt2
  expanseData.objects[btn2.id] = btn2
  expanseData.objects[btn2Text.id] = btn2Text
  
  expanseData.objects[rt3.id] = rt3
  expanseData.objects[btn3.id] = btn3
  expanseData.objects[btn3Text.id] = btn3Text
  expanseData.objects[rt4.id] = rt4
  expanseData.objects[btn4.id] = btn4
  expanseData.objects[btn4Text.id] = btn4Text
}

rebuildFalkreath()

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Rebuilt Falkreath completely')
