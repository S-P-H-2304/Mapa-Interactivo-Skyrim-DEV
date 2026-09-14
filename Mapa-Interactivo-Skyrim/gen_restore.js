const fs = require('fs');
const expanseData = JSON.parse(fs.readFileSync('src/.expanse.json', 'utf8'));

const mappings = [];
Object.values(expanseData.objects).forEach(o => {
  if (o.components) {
    for (let k in o.components) {
      if (o.components[k].name === 'unlockLocationOnClick') {
        const p = o.components[k].parameters;
        if (p.locationName && p.markerToUnlock && p.markerToUnlock.id) {
          mappings.push({
            locationName: p.locationName,
            markerEid: p.markerToUnlock.id
          });
        }
      }
    }
  }
});

let tsCode = `import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

ecs.registerComponent({
  name: 'restoreProgress',
  schema: {},
  stateMachine: ({ world, eid }) => {
    ecs.defineState('default').initial().onEnter(() => {
      // Re-habilitar marcadores desbloqueados
      const mappings = [
${mappings.map(m => `        { name: "${m.locationName}", eid: "${m.markerEid}" }`).join(',\n')}
      ]

      for (const m of mappings) {
        if (dataManager.isLocationUnlocked(m.name)) {
          // El ID del entity de 8th Wall es un string numérico a veces, pero en ECS es un número de 64 bits.
          // Para usar IDs literales del editor en runtime, podemos buscar por nombre o usar el eid si es inyectado.
          // ERROR: No podemos instanciar un EID desde un UUID string directamente en runtime de forma segura a menos que el engine lo exponga.
        }
      }
    })
  }
})
`
console.log(tsCode)
