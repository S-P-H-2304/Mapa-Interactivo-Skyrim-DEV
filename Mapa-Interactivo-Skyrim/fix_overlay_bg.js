const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

let changed = 0;
Object.values(expanseData.objects).forEach(obj => {
  if (obj.ui && obj.ui.type === 'overlay') {
    if (obj.ui.background === undefined && obj.ui.image === undefined) {
      if (obj.name !== 'Background Frame' && obj.name !== 'Instrucciones') {
        obj.ui.background = '#000000'
        obj.ui.backgroundOpacity = 0
        changed++
      }
    }
  }
})

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed undefined backgrounds on', changed, 'overlays')
