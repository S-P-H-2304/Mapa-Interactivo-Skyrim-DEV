const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))
const allObjs = Object.values(expanseData.objects)

const tplUiRumorId = 'a3828348-7945-4330-9d8a-ba310a783670'
const rumorChildren = allObjs.filter(o => o.parentId === tplUiRumorId)

const rt2 = rumorChildren.find(o => o.name === 'RumorText (1)')
const btnCont1 = rumorChildren.find(o => o.name === 'Continuar Boton')
const btnCont2 = rumorChildren.find(o => o.name === 'Continuar Boton 2')

// 1. Quitar showTarget2 de btnCont1
for (const k of Object.keys(btnCont1.components)) {
  const comp = btnCont1.components[k]
  if (comp.name === 'toggleVisibilityOnClick' && comp.parameters) {
    delete comp.parameters.showTarget2
  }
}

// 2. Añadir enableTarget a rt2
for (const k of Object.keys(rt2.components)) {
  const comp = rt2.components[k]
  if (comp.name === 'typewriterText') {
    if (!comp.parameters) comp.parameters = {}
    comp.parameters.enableTarget = { type: 'entity', id: btnCont2.id }
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Wiring for typewriter done!')
