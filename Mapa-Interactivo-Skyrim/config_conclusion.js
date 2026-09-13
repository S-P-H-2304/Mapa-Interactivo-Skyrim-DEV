const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const newLocPanel = Object.values(expanseData.objects).find(o => o.name === 'UI Nueva Ubicación')
const alerta = Object.values(expanseData.objects).find(o => o.name === 'Alerta Desbloqueo' && o.parentId === newLocPanel.id)
const titleEid = alerta ? alerta.id : null

const imageDesbloqueo = Object.values(expanseData.objects).find(o => o.name === 'Logo Desbloqueo' && o.parentId === newLocPanel.id)
const nombreDesbloqueo = Object.values(expanseData.objects).find(o => o.name === 'Nombre Ciudad Desbloqueo' && o.parentId === newLocPanel.id)

const bgFrameId = '473c7055-07c6-433b-b166-03684ad7a490'

if (titleEid) {
  Object.values(expanseData.objects).forEach(obj => {
    if (obj.components) {
      for (const key in obj.components) {
        if (obj.components[key].name === 'unlockLocationOnClick') {
          obj.components[key].parameters.titleElement = { type: 'entity', id: titleEid }
        }
      }
    }
  })
}

function addComponent(entity, name, params = {}) {
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

function wipeActionComponents(entity) {
  if (!entity || !entity.components) return;
  for (const key in entity.components) {
    const cname = entity.components[key].name;
    if (cname === 'toggleVisibilityOnClick' || cname === 'unlockLocationOnClick') {
      delete entity.components[key]
    }
  }
}

// 1. Configure Tumba conclusion (Continuar Boton 2 Tumba)
const tumbaBtn = Object.values(expanseData.objects).find(o => o.name === 'Continuar Boton 2 Tumba')
const tumbaPanel = Object.values(expanseData.objects).find(o => o.name === 'UI Rumor Tumba')
if (tumbaBtn && tumbaPanel) {
  wipeActionComponents(tumbaBtn)
  addComponent(tumbaBtn, 'unlockLocationOnClick', {
    panelToHide: { type: 'entity', id: tumbaPanel.id },
    backgroundFrame: { type: 'entity', id: bgFrameId },
    uiNuevaUbicacion: { type: 'entity', id: newLocPanel.id },
    imageElement: { type: 'entity', id: imageDesbloqueo.id },
    nameElement: { type: 'entity', id: nombreDesbloqueo.id },
    titleElement: { type: 'entity', id: titleEid },
    titleText: 'Misiones Completadas',
    locationName: 'Senda de Los Compañeros',
    imageSrc: 'assets/Iconos/UI/Wolf.png'
  })
}

// 2. Configure Gruta conclusion (Continuar Boton 2 Gruta)
const grutaBtn = Object.values(expanseData.objects).find(o => o.name === 'Continuar Boton 2 Gruta')
const grutaPanel = Object.values(expanseData.objects).find(o => o.name === 'UI Rumor Gruta')
if (grutaBtn && grutaPanel) {
  wipeActionComponents(grutaBtn)
  addComponent(grutaBtn, 'unlockLocationOnClick', {
    panelToHide: { type: 'entity', id: grutaPanel.id },
    backgroundFrame: { type: 'entity', id: bgFrameId },
    uiNuevaUbicacion: { type: 'entity', id: newLocPanel.id },
    imageElement: { type: 'entity', id: imageDesbloqueo.id },
    nameElement: { type: 'entity', id: nombreDesbloqueo.id },
    titleElement: { type: 'entity', id: titleEid },
    titleText: 'Misiones Completadas',
    locationName: 'Senda de La Licantropía Daedrica',
    imageSrc: 'assets/Iconos/UI/Wolf.png'
  })
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Conclusion panels configured successfully!')
