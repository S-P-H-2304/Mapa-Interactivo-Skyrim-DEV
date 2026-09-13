const fs = require('fs')
const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

let c = 0
Object.values(expanseData.objects).forEach(obj => {
  if (obj.name === 'Sound Up') {
    obj.ui.background = '#ffffff'
    obj.ui.backgroundOpacity = 1
  } else if (obj.ui && obj.ui.type === 'overlay') {
    if (obj.ui.background === '#000000' && obj.ui.backgroundOpacity === 0) {
      if (!obj.name.startsWith('UI Ubicación') && obj.name !== 'Background Frame') {
        delete obj.ui.background
        delete obj.ui.backgroundOpacity
        c++
      }
    }
  }
})
fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Reverted', c, 'overlays')
