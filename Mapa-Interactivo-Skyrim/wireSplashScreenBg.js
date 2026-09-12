const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const bgFrameObj = Object.values(expanseData.objects).find(o => o.name === 'Background Frame')
const bgFrameId = bgFrameObj ? bgFrameObj.id : null

if (bgFrameId) {
  for (const objId of Object.keys(expanseData.objects)) {
    const obj = expanseData.objects[objId]
    if (obj.components) {
      for (const compId of Object.keys(obj.components)) {
        const comp = obj.components[compId]
        if (comp.name === 'rotateVideoOverlay' && comp.parameters) {
          comp.parameters.backgroundFrame = { type: 'entity', id: bgFrameId }
        }
      }
    }
  }
  fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
  console.log('splashScreen (rotateVideoOverlay) component updated in expanse.json!')
} else {
  console.log('Background Frame not found')
}
