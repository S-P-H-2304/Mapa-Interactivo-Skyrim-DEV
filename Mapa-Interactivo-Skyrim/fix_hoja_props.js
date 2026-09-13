const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

Object.values(expanseData.objects).forEach(o => {
  if (o.name === 'Hoja 1 Falkreath' || o.name === 'Hoja 2 Falkreath') {
    if (o.transform) {
      o.position = o.transform.position || [0,0,0]
      o.rotation = o.transform.rotation || [0,0,0,1]
      o.scale = o.transform.scale || [1,1,1]
      delete o.transform
    } else if (!o.position) {
      o.position = [0,0,0]
      o.rotation = [0,0,0,1]
      o.scale = [1,1,1]
    }
  }
})

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed Hoja properties!')
