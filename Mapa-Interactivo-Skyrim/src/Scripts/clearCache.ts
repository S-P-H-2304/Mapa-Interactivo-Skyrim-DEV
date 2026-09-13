import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

/**
 * clearCache — Componente de utilidad para pruebas.
 * Agrega este componente a cualquier entidad vacía en la escena para borrar
 * toda la caché guardada (localStorage) al iniciar. Quítalo antes de producción.
 */
ecs.registerComponent({
  name: 'clearCache',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataManager.clearAll()
        console.log('[clearCache] Caché borrada — localStorage reseteado. Quita este componente antes de producción.')
      })
  },
})
