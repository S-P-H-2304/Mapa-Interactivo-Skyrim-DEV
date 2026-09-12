const fs = require('fs')
const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const cbOrigBtn2 = expanseData.objects['27f7418d-0db6-446f-bc3a-3589cd615c3f']
const tumuloMarker = Object.values(expanseData.objects).find(o => o.name === 'Tumulo Marcador')

if (cbOrigBtn2) {
  let unlockComp = Object.values(cbOrigBtn2.components).find(c => c.name === 'unlockLocationOnClick')
  if (unlockComp) {
    unlockComp.parameters.imageSrc = 'assets/Iconos/Ubicaciones/Cueva.png'
    unlockComp.parameters.locationName = 'Túmulo del Hombre de Polvo'
    if (tumuloMarker) {
       unlockComp.parameters.markerToUnlock = { type: 'entity', id: tumuloMarker.id }
    }
  }
}

// Ensure Tumulo marker is actually disabled at start
if (tumuloMarker) tumuloMarker.disabled = true;

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Fixed Carrera Blanca template parameters')
