const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

Object.values(expanseData.objects).forEach(obj => {
  if (obj.components) {
    for (const key in obj.components) {
      if (obj.components[key].name === 'uiSoundOnClick') {
        let soundFile = obj.components[key].parameters.soundFile
        if (soundFile && soundFile.includes('Efectos de sonido')) {
          const name = soundFile.split('/').pop()
          obj.components[key].parameters.soundFile = `assets/Sonido/Efectos de Sonido/${name}`
        }
      }
    }
  }
})

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed sound asset paths')
