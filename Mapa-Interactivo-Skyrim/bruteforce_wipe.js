const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'))

const newLocPanelId = '57300f21-0ba5-4056-bd67-6fd11acbc745'
const newLocNameId = '02257a0f-f15f-4661-ad15-2f6ea61b47a9'
const newLocImageId = '00dcd921-eff0-463b-89f0-3ea9f9e4ffa7'
const bgFrameId = '473c7055-07c6-433b-b166-03684ad7a490'

function wipeActionComponents(entity) {
  if (!entity || !entity.components) return;
  for (const key in entity.components) {
    const cname = entity.components[key].name;
    if (cname === 'toggleVisibilityOnClick' || cname === 'unlockLocationOnClick') {
      delete entity.components[key]
    }
  }
}

function addComponent(entity, name, params = {}) {
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

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

// BRUTE FORCE WIPE FIRST
Object.values(expanseData.objects).forEach(obj => {
  if (
    obj.name.startsWith('Continuar') || 
    obj.name.startsWith('Salir') || 
    obj.name.startsWith('Atrás') || 
    obj.name.startsWith('Rumor ') // Not RumorText, just Rumor button
  ) {
    wipeActionComponents(obj)
  }
})

// REBUILD EXACTLY
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
    const ubiChildren = Object.values(expanseData.objects).filter(o => o.parentId === ubiPanel.id)
    const salirBtn = ubiChildren.find(o => o.name.startsWith('Salir'))
    if (salirBtn) {
      addComponent(salirBtn, 'toggleVisibilityOnClick', {
        hideTarget1: { type: 'entity', id: ubiPanel.id },
        backgroundFrame: { type: 'entity', id: bgFrameId }
      })
    }

    const rumorBtn = ubiChildren.find(o => o.name.startsWith('Rumor '))
    if (rumorBtn && rumorPanel) {
      addComponent(rumorBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rumorPanel.id },
        hideTarget1: { type: 'entity', id: ubiPanel.id }
      })
    }
  }

  if (rumorPanel && city.rumors && city.rumors.length > 0) {
    const rumorChildren = Object.values(expanseData.objects).filter(o => o.parentId === rumorPanel.id)
    
    const atrasBtn = rumorChildren.find(o => o.name.startsWith('Atrás') || o.name.startsWith('Salir'))
    if (atrasBtn && ubiPanel) {
      addComponent(atrasBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: ubiPanel.id },
        hideTarget1: { type: 'entity', id: rumorPanel.id }
      })
    }

    const rt1 = rumorChildren.find(o => o.name.startsWith('RumorText') && !o.name.includes(' 2') && !o.name.includes(' 3'))
    const rt2 = rumorChildren.find(o => o.name.startsWith('RumorText 2'))
    const rt3 = rumorChildren.find(o => o.name.startsWith('RumorText 3'))

    const btn1 = rumorChildren.find(o => o.name.startsWith('Continuar Boton') && !o.name.includes(' 2') && !o.name.includes(' 3'))
    const btn2 = rumorChildren.find(o => o.name.startsWith('Continuar Boton 2'))
    const btn3 = rumorChildren.find(o => o.name.startsWith('Continuar Boton 3'))

    if (city.rumors.length === 1 && btn1) {
      const r = city.rumors[0]
      if (r.unlockLocation) {
        addComponent(btn1, 'unlockLocationOnClick', {
          panelToHide: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId },
          uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
          imageElement: { type: 'entity', id: newLocImageId },
          nameElement: { type: 'entity', id: newLocNameId },
          imageSrc: r.unlockLocation.image,
          locationName: r.unlockLocation.name,
          markerToUnlock: getMarkerForCity(r.unlockLocation.markerName) ? { type: 'entity', id: getMarkerForCity(r.unlockLocation.markerName).id } : undefined
        })
      } else {
        addComponent(btn1, 'toggleVisibilityOnClick', {
          hideTarget1: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId }
        })
      }
    } else if (city.rumors.length === 2 && btn1 && btn2) {
      addComponent(btn1, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rt2.id },
        hideTarget1: { type: 'entity', id: btn1.id }
      })
      const r = city.rumors[1]
      if (r.unlockLocation) {
        addComponent(btn2, 'unlockLocationOnClick', {
          panelToHide: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId },
          uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
          imageElement: { type: 'entity', id: newLocImageId },
          nameElement: { type: 'entity', id: newLocNameId },
          imageSrc: r.unlockLocation.image,
          locationName: r.unlockLocation.name,
          markerToUnlock: getMarkerForCity(r.unlockLocation.markerName) ? { type: 'entity', id: getMarkerForCity(r.unlockLocation.markerName).id } : undefined
        })
      } else {
        addComponent(btn2, 'toggleVisibilityOnClick', {
          hideTarget1: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId }
        })
      }
    } else if (city.rumors.length === 3 && btn1 && btn2 && btn3) {
      addComponent(btn1, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rt2.id },
        hideTarget1: { type: 'entity', id: btn1.id }
      })
      addComponent(btn2, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rt3.id },
        hideTarget1: { type: 'entity', id: btn2.id },
        hideTarget2: { type: 'entity', id: rt1.id }
      })
      const r = city.rumors[2]
      if (r.unlockLocation) {
        addComponent(btn3, 'unlockLocationOnClick', {
          panelToHide: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId },
          uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
          imageElement: { type: 'entity', id: newLocImageId },
          nameElement: { type: 'entity', id: newLocNameId },
          imageSrc: r.unlockLocation.image,
          locationName: r.unlockLocation.name,
          markerToUnlock: getMarkerForCity(r.unlockLocation.markerName) ? { type: 'entity', id: getMarkerForCity(r.unlockLocation.markerName).id } : undefined
        })
      } else {
        addComponent(btn3, 'toggleVisibilityOnClick', {
          hideTarget1: { type: 'entity', id: rumorPanel.id },
          backgroundFrame: { type: 'entity', id: bgFrameId }
        })
      }
    }
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed brute force rebuild script!')
