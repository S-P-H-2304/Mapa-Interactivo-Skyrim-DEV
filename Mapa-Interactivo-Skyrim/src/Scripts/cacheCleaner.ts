import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

// Exponer en window para poder limpiar desde la consola del navegador si se desea
if (typeof window !== 'undefined') {
  ;(window as any).clearCache = () => {
    console.log('[window.clearCache] Limpiando caché manualmente...')
    dataManager.clearData()
  }
}

ecs.registerComponent({
  name: 'cacheCleaner',
  schema: {
    // @label Limpiar al iniciar
    enabled: ecs.boolean,
  },
  schemaDefaults: {
    enabled: true,
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    const doClean = () => {
      let shouldClean = true
      try {
        const config = schemaAttribute.get(eid)
        if (config && config.enabled !== undefined) {
          shouldClean = !!config.enabled
        }
      } catch (e) {
        shouldClean = true
      }

      if (shouldClean) {
        console.log('[cacheCleaner] Limpiando caché local al iniciar (Play)...')
        try {
          dataManager.clearData()
        } catch (err) {
          console.error('[cacheCleaner] Error limpiando caché:', err)
        }
      }
    }

    // Ejecución inmediata en la inicialización
    doClean()

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        doClean()
      })
  },
})
