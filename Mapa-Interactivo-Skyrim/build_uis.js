const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'))

const tplUiUbiId = 'f851be6c-7f6b-4fc4-9cf5-7de203845568'
const tplUiRumorId = 'a3828348-7945-4330-9d8a-ba310a783670'
const tplRootId = expanseData.objects[tplUiUbiId].parentId
const newLocPanelId = '57300f21-0ba5-4056-bd67-6fd11acbc745'
const newLocNameId = '02257a0f-f15f-4661-ad15-2f6ea61b47a9'
const newLocImageId = '00dcd921-eff0-463b-89f0-3ea9f9e4ffa7'
const bgFrameId = '473c7055-07c6-433b-b166-03684ad7a490'

function cloneTree(rootId, newParentId) {
  const newObjs = []
  const idMap = {}
  
  function cloneNode(nodeId, parentId) {
    const orig = expanseData.objects[nodeId]
    const newObj = JSON.parse(JSON.stringify(orig))
    newObj.id = uuid()
    newObj.parentId = parentId
    idMap[nodeId] = newObj.id
    newObjs.push(newObj)
    
    // Clean up connections so they don't affect templates
    if (newObj.components) {
      for (let key in newObj.components) {
        if (newObj.components[key].parameters) {
          const p = newObj.components[key].parameters
          for (let param in p) {
            if (p[param] && p[param].type === 'entity' && idMap[p[param].id]) {
              p[param].id = idMap[p[param].id]
            }
          }
        }
      }
    }
    
    const children = Object.values(expanseData.objects).filter(o => o.parentId === nodeId)
    children.forEach(c => cloneNode(c.id, newObj.id))
  }
  
  cloneNode(rootId, newParentId)
  
  // Post-pass map update
  newObjs.forEach(o => {
    if (o.components) {
      for (let key in o.components) {
        if (o.components[key].parameters) {
          const p = o.components[key].parameters
          for (let param in p) {
            if (p[param] && p[param].type === 'entity' && idMap[p[param].id]) {
              p[param].id = idMap[p[param].id]
            }
          }
        }
      }
    }
  })
  return { rootId: idMap[rootId], cloneObjects: newObjs, idMap }
}

function findEntityByName(partialName, arr) {
  return arr.find(o => o.name.includes(partialName))
}
function updateUiText(entity, text) {
  if (entity && entity.ui) entity.ui.text = text
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
function addComponent(entity, name, params = {}) {
  const id = `${name}_${uuid()}`
  if (!entity.components) entity.components = {}
  entity.components[id] = { id, name, parameters: params }
  return id
}

// Clean up existing clones (for safety)
const toDelete = []
Object.values(expanseData.objects).forEach(o => {
  if (o.name.startsWith('UI Ubicaci') || o.name.startsWith('UI Rumor')) {
    if (o.id !== tplUiUbiId && o.id !== tplUiRumorId) {
      toDelete.push(o.id)
      const children = Object.values(expanseData.objects).filter(c => c.parentId === o.id)
      children.forEach(c => {
         toDelete.push(c.id)
         const gc = Object.values(expanseData.objects).filter(g => g.parentId === c.id)
         gc.forEach(g => toDelete.push(g.id))
      })
    }
  }
})
toDelete.forEach(id => delete expanseData.objects[id])

for (const city of cities) {
  if (city.name === 'Carrera Blanca') continue; // keep template

  const ubiCloneInfo = cloneTree(tplUiUbiId, tplRootId)
  const ubiPanelId = ubiCloneInfo.rootId
  const ubiPanel = ubiCloneInfo.cloneObjects.find(o => o.id === ubiPanelId)
  ubiPanel.name = `UI Ubicación ${city.name}`
  
  const ubiChildren = ubiCloneInfo.cloneObjects.filter(o => o.parentId === ubiPanelId)
  
  const title = findEntityByName('Título', ubiChildren)
  updateUiText(title, city.name)
  const cuerpo = findEntityByName('Cuerpo', ubiChildren)
  updateUiText(cuerpo, city.cuerpo)
  const notas = findEntityByName('Notas', ubiChildren)
  updateUiText(notas, city.notas)

  const logo = findEntityByName('Logo', ubiChildren)
  if (logo && logo.ui && logo.ui.image) {
    logo.ui.image.asset = `assets/Iconos/Ubicaciones/${city.name}.png`
  }
  const wikiBtn = findEntityByName('Wiki', ubiChildren)
  if (wikiBtn) {
    const linkComp = Object.values(wikiBtn.components).find(c => c.name === 'linkButton')
    if (linkComp) linkComp.parameters.url = city.url
  }

  const salirBtn = findEntityByName('Salir', ubiChildren)
  addComponent(salirBtn, 'toggleVisibilityOnClick', {
    hideTarget1: { type: 'entity', id: ubiPanelId },
    backgroundFrame: { type: 'entity', id: bgFrameId }
  })

  const marker = getMarkerForCity(city.name)
  if (marker) {
    let pIntKey = Object.keys(marker.components || {}).find(k => marker.components[k].name === 'playerInteraction')
    if (pIntKey) {
      marker.components[pIntKey].parameters.uiPanel = { type: 'entity', id: ubiPanelId }
      marker.components[pIntKey].parameters.backgroundFrame = { type: 'entity', id: bgFrameId }
    }
    // Set startsLocked appropriately
    if (city.startsLocked) {
      marker.disabled = true
    }
  }

  if (city.rumors && city.rumors.length > 0) {
    const rumorCloneInfo = cloneTree(tplUiRumorId, tplRootId)
    const rumorPanelId = rumorCloneInfo.rootId
    const rumorPanel = rumorCloneInfo.cloneObjects.find(o => o.id === rumorPanelId)
    rumorPanel.name = `UI Rumor ${city.name}`

    const rumorBtn = findEntityByName('Rumor', ubiChildren)
    addComponent(rumorBtn, 'toggleVisibilityOnClick', {
      showTarget1: { type: 'entity', id: rumorPanelId },
      hideTarget1: { type: 'entity', id: ubiPanelId }
    })

    const rumorChildren = rumorCloneInfo.cloneObjects.filter(o => o.parentId === rumorPanelId)
    const atrasBtn = findEntityByName('Salir', rumorChildren) || findEntityByName('Atrás', rumorChildren)
    if (atrasBtn) {
      atrasBtn.name = `Atrás ${city.name}`
      const atrasText = rumorCloneInfo.cloneObjects.find(o => o.parentId === atrasBtn.id && o.name.includes('Text'))
      updateUiText(atrasText, 'Atrás')
      addComponent(atrasBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: ubiPanelId },
        hideTarget1: { type: 'entity', id: rumorPanelId }
      })
    }

    const rt1 = findEntityByName('RumorText', rumorChildren)
    const btnCont1 = findEntityByName('Continuar Boton', rumorChildren)
    
    // Text 2 is generated by cloneTree, we'll keep it or create it
    const rt2 = findEntityByName('RumorText 2', rumorChildren) || rumorChildren.find(o => o.name.includes('RumorText') && o.id !== rt1.id)
    const btnCont2 = findEntityByName('Continuar Boton 2', rumorChildren)
    
    // Set Text 1
    updateUiText(rt1, city.rumors[0].text)
    // Update Button 1 text
    const btnCont1Text = rumorCloneInfo.cloneObjects.find(o => o.parentId === btnCont1.id && o.name.includes('Boton Texto'))
    updateUiText(btnCont1Text, city.rumors[0].btnText)
    
    // Enable Target on Text 1
    const twComp1 = Object.values(rt1.components).find(c => c.name === 'typewriterText')
    if (twComp1) twComp1.parameters.enableTarget = { type: 'entity', id: btnCont1.id }
    btnCont1.disabled = true;

    if (city.rumors.length === 1) {
      // Remove text 2 and button 2
      [rt2, btnCont2].forEach(e => {
         if (e) {
           const eIdx = rumorCloneInfo.cloneObjects.findIndex(o => o.id === e.id)
           if (eIdx !== -1) rumorCloneInfo.cloneObjects.splice(eIdx, 1)
           const child = rumorCloneInfo.cloneObjects.find(o => o.parentId === e.id)
           if (child) {
              const cIdx = rumorCloneInfo.cloneObjects.findIndex(o => o.id === child.id)
              if (cIdx !== -1) rumorCloneInfo.cloneObjects.splice(cIdx, 1)
           }
         }
      })
      
      const r = city.rumors[0]
      if (r.unlockLocation) {
        const tgtMarker = getMarkerForCity(r.unlockLocation.markerName)
        addComponent(btnCont1, 'unlockLocationOnClick', {
          panelToHide: { type: 'entity', id: rumorPanelId },
          backgroundFrame: { type: 'entity', id: bgFrameId },
          uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
          imageElement: { type: 'entity', id: newLocImageId },
          nameElement: { type: 'entity', id: newLocNameId },
          imageSrc: r.unlockLocation.image,
          locationName: r.unlockLocation.name,
          markerToUnlock: tgtMarker ? { type: 'entity', id: tgtMarker.id } : undefined
        })
      } else {
        addComponent(btnCont1, 'toggleVisibilityOnClick', {
          hideTarget1: { type: 'entity', id: rumorPanelId },
          backgroundFrame: { type: 'entity', id: bgFrameId }
        })
      }
    } else {
      // Multiple rumors
      updateUiText(rt2, city.rumors[1].text)
      const btnCont2Text = rumorCloneInfo.cloneObjects.find(o => o.parentId === btnCont2.id && o.name.includes('Boton Texto'))
      updateUiText(btnCont2Text, city.rumors[1].btnText)
      
      rt2.disabled = true;
      btnCont2.disabled = true;
      const twComp2 = Object.values(rt2.components).find(c => c.name === 'typewriterText')
      if (twComp2) twComp2.parameters.enableTarget = { type: 'entity', id: btnCont2.id }

      addComponent(btnCont1, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rt2.id },
        hideTarget1: { type: 'entity', id: btnCont1.id }
      })

      if (city.rumors.length === 2) {
        const r = city.rumors[1]
        if (r.unlockLocation) {
          const tgtMarker = getMarkerForCity(r.unlockLocation.markerName)
          addComponent(btnCont2, 'unlockLocationOnClick', {
            panelToHide: { type: 'entity', id: rumorPanelId },
            backgroundFrame: { type: 'entity', id: bgFrameId },
            uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
            imageElement: { type: 'entity', id: newLocImageId },
            nameElement: { type: 'entity', id: newLocNameId },
            imageSrc: r.unlockLocation.image,
            locationName: r.unlockLocation.name,
            markerToUnlock: tgtMarker ? { type: 'entity', id: tgtMarker.id } : undefined
          })
        } else {
          addComponent(btnCont2, 'toggleVisibilityOnClick', {
            hideTarget1: { type: 'entity', id: rumorPanelId },
            backgroundFrame: { type: 'entity', id: bgFrameId }
          })
        }
      } else {
        // 3 rumors (Túmulo)
        const rt3 = JSON.parse(JSON.stringify(rt1))
        rt3.id = uuid()
        rt3.name = `RumorText 3 ${city.name}`
        updateUiText(rt3, city.rumors[2].text)
        rt3.disabled = true;

        const btnCont3 = JSON.parse(JSON.stringify(btnCont1))
        btnCont3.id = uuid()
        btnCont3.name = `Continuar Boton 3 ${city.name}`
        btnCont3.ui.top = rt2.ui.top + rt2.ui.height + 20
        btnCont3.ui.left = rt2.ui.left
        
        const btnCont3Child = JSON.parse(JSON.stringify(rumorCloneInfo.cloneObjects.find(o => o.parentId === btnCont1.id)))
        btnCont3Child.id = uuid()
        btnCont3Child.parentId = btnCont3.id
        updateUiText(btnCont3Child, city.rumors[2].btnText)
        btnCont3.disabled = true;

        rumorCloneInfo.cloneObjects.push(rt3, btnCont3, btnCont3Child)
        
        // Add typewriter component to rt3 if not exists
        let twComp3Key = Object.keys(rt3.components).find(k => rt3.components[k].name === 'typewriterText')
        if (!twComp3Key) {
            twComp3Key = addComponent(rt3, 'typewriterText')
        }
        rt3.components[twComp3Key].parameters.enableTarget = { type: 'entity', id: btnCont3.id }

        addComponent(btnCont2, 'toggleVisibilityOnClick', {
          showTarget1: { type: 'entity', id: rt3.id },
          hideTarget1: { type: 'entity', id: btnCont2.id },
          hideTarget2: { type: 'entity', id: rt1.id } // clean up space if needed
        })

        const r = city.rumors[2]
        if (r.unlockLocation) {
          const tgtMarker = getMarkerForCity(r.unlockLocation.markerName)
          addComponent(btnCont3, 'unlockLocationOnClick', {
            panelToHide: { type: 'entity', id: rumorPanelId },
            backgroundFrame: { type: 'entity', id: bgFrameId },
            uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
            imageElement: { type: 'entity', id: newLocImageId },
            nameElement: { type: 'entity', id: newLocNameId },
            imageSrc: r.unlockLocation.image,
            locationName: r.unlockLocation.name,
            markerToUnlock: tgtMarker ? { type: 'entity', id: tgtMarker.id } : undefined
          })
        } else {
          addComponent(btnCont3, 'toggleVisibilityOnClick', {
            hideTarget1: { type: 'entity', id: rumorPanelId },
            backgroundFrame: { type: 'entity', id: bgFrameId }
          })
        }
      }
    }

    rumorCloneInfo.cloneObjects.forEach(o => { expanseData.objects[o.id] = o })
    rumorPanel.disabled = true;
  } else {
    const rumorBtn = findEntityByName('Rumor', ubiChildren)
    if (rumorBtn) {
      const rmBtnChildren = ubiCloneInfo.cloneObjects.filter(o => o.parentId === rumorBtn.id)
      rmBtnChildren.forEach(o => { delete expanseData.objects[o.id] })
      
      const idx = ubiCloneInfo.cloneObjects.findIndex(o => o.id === rumorBtn.id)
      if (idx !== -1) ubiCloneInfo.cloneObjects.splice(idx, 1)
    }
  }

  ubiPanel.disabled = true;
  ubiCloneInfo.cloneObjects.forEach(o => { expanseData.objects[o.id] = o })
}

fs.writeFileSync('src/.expanse.json', JSON.stringify(expanseData, null, 2))
console.log('UI iteration finished successfully.')
