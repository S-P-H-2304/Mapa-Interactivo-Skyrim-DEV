import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

ecs.registerComponent({
  name: 'restoreProgress',
  schema: {
    markerTumulo: ecs.eid,
    markerAquelarre: ecs.eid,
    markerTumba: ecs.eid,
    markerGruta: ecs.eid,
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    ecs.defineState('default').initial().onEnter(() => {
      // Esperar unos frames para asegurar que los marcadores ya se instanciaron en el ECS
      world.time.setTimeout(() => {
        const { markerTumulo, markerAquelarre, markerTumba, markerGruta } = schemaAttribute.get(eid)

        let count = 0
        if (markerTumulo && dataManager.isLocationUnlocked("Túmulo del Hombre de Polvo")) {
          ecs.Disabled.remove(world, markerTumulo)
          count++
        }
        if (markerAquelarre && dataManager.isLocationUnlocked("Aquelarre de Glenmoril")) {
          ecs.Disabled.remove(world, markerAquelarre)
          count++
        }
        if (markerTumba && dataManager.isLocationUnlocked("Tumba de Ysgramor")) {
          ecs.Disabled.remove(world, markerTumba)
          count++
        }
        if (markerGruta && dataManager.isLocationUnlocked("Gruta del Hombre Hinchado")) {
          ecs.Disabled.remove(world, markerGruta)
          count++
        }
        
        console.log(`[restoreProgress] Restaurados ${count} marcadores desde dataManager.`)
      }, 500)
    })
  }
})
