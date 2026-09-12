const fs = require('fs')
const crypto = require('crypto')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const uuid = () => crypto.randomUUID()

const tplUiGeneralId = 'a54faf48-4607-4acc-b464-34879c8cac78'
const tplUiUbiId = 'f851be6c-7f6b-4fc4-9cf5-7de203845568'
const tplUiRumorId = 'a3828348-7945-4330-9d8a-ba310a783670'
const newLocPanelId = '57300f21-0ba5-4056-bd67-6fd11acbc745'
const newLocImageId = '00dcd921-eff0-463b-89f0-3ea9f9e4ffa7'
const newLocNameId = '02257a0f-f15f-4661-ad15-2f6ea61b47a9'

const addComponent = (obj, compName, params) => {
  if (!obj.components) obj.components = {}
  // Clean existing component of same name to avoid duplicates
  for (const k of Object.keys(obj.components)) {
    if (obj.components[k].name === compName) {
      delete obj.components[k]
    }
  }
  const cid = uuid()
  obj.components[cid] = { id: cid, name: compName, parameters: params }
}

const allObjs = Object.values(expanseData.objects)
const ubiChildren = allObjs.filter(o => o.parentId === tplUiUbiId)
const rumorChildren = allObjs.filter(o => o.parentId === tplUiRumorId)

// 1. Boton rumor
const rumorBtn = ubiChildren.find(o => o.name === 'Rumor')
addComponent(rumorBtn, 'toggleVisibilityOnClick', {
  showTarget1: { type: 'entity', id: tplUiRumorId },
  hideTarget1: { type: 'entity', id: tplUiUbiId }
})

// 2. Boton salir
const salirBtn = ubiChildren.find(o => o.name === 'Salir')
addComponent(salirBtn, 'toggleVisibilityOnClick', {
  hideTarget1: { type: 'entity', id: tplUiUbiId },
  resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
})

// 3. Boton continuar 1
const rt1 = rumorChildren.find(o => o.name === 'RumorText')
const rt2 = rumorChildren.find(o => o.name === 'RumorText (1)')
const btnCont1 = rumorChildren.find(o => o.name === 'Continuar Boton')

// Creamos btnCont2 clonando btnCont1
let btnCont2 = rumorChildren.find(o => o.name === 'Continuar Boton 2')
if (!btnCont2) {
  btnCont2 = JSON.parse(JSON.stringify(btnCont1))
  btnCont2.id = uuid()
  btnCont2.name = 'Continuar Boton 2'
  // clone its children (the text inside the button)
  const btnCont1Child = allObjs.find(o => o.parentId === btnCont1.id)
  const btnCont2Child = JSON.parse(JSON.stringify(btnCont1Child))
  btnCont2Child.id = uuid()
  btnCont2Child.parentId = btnCont2.id
  expanseData.objects[btnCont2.id] = btnCont2
  expanseData.objects[btnCont2Child.id] = btnCont2Child
}

rt2.disabled = true
btnCont2.disabled = true

addComponent(btnCont1, 'toggleVisibilityOnClick', {
  showTarget1: { type: 'entity', id: rt2.id },
  showTarget2: { type: 'entity', id: btnCont2.id },
  hideTarget1: { type: 'entity', id: rt1.id },
  hideTarget2: { type: 'entity', id: btnCont1.id }
})

// 4. Boton nueva ubicación (btnCont2)
addComponent(btnCont2, 'unlockLocationOnClick', {
  panelToHide: { type: 'entity', id: tplUiRumorId },
  uiGeneral: { type: 'entity', id: tplUiGeneralId },
  uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
  imageElement: { type: 'entity', id: newLocImageId },
  nameElement: { type: 'entity', id: newLocNameId },
  imageSrc: 'assets/Iconos/UI/Cueva.png',
  locationName: 'Ubicación de Prueba'
})

// 5. Boton Atras en Rumor
const atrasRumor = rumorChildren.find(o => o.name.includes('Salir'))
if (atrasRumor) {
  addComponent(atrasRumor, 'toggleVisibilityOnClick', {
    showTarget1: { type: 'entity', id: tplUiUbiId },
    hideTarget1: { type: 'entity', id: tplUiRumorId }
  })
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Test configuration wired successfully!')
