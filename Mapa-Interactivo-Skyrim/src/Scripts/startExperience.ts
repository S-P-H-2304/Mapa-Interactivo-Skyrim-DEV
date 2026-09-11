import * as ecs from '@8thwall/ecs'
import { START_EXPERIENCE } from './audioEvents'

ecs.registerComponent({
  name: 'startExperience',
  schema: {
    // @label Panel de Instrucciones
    instructionsPanel: ecs.eid,
    // @label Panel de UI General
    generalUiPanel: ecs.eid,
    // @label Audio Principal / Ambiental
    ambientAudio: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const state = ecs.defineState('default').initial()

    const onClick = () => {
      const schema = schemaAttribute.get(eid)

      // 1. Desactivar y ocultar el panel de instrucciones
      if (schema.instructionsPanel) {
        ecs.Disabled.set(world, schema.instructionsPanel, {})
        ecs.Hidden.set(world, schema.instructionsPanel, {})
      }

      // 2. Activar y mostrar el panel de UI General
      if (schema.generalUiPanel) {
        if (ecs.Disabled.has(world, schema.generalUiPanel)) {
          ecs.Disabled.remove(world, schema.generalUiPanel)
        }
        if (ecs.Hidden.has(world, schema.generalUiPanel)) {
          ecs.Hidden.remove(world, schema.generalUiPanel)
        }
      }

      // 3. Darle play al audio del audioManager
      if (schema.ambientAudio && ecs.Audio.has(world, schema.ambientAudio)) {
        ecs.Audio.mutate(world, schema.ambientAudio, (cursor) => {
          cursor.paused = false
        })
      }
      // Disparar evento global para AudioManager
      world.events.dispatch(world.events.globalId, START_EXPERIENCE, {})

      // 4. Activar Fullscreen y bloqueo Horizontal en Android con el toque del usuario
      if (typeof document !== 'undefined') {
        const docEl = document.documentElement
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {})
          } else if ((docEl as any).webkitRequestFullscreen) {
            ;(docEl as any).webkitRequestFullscreen()
          }
        }
        if (screen.orientation && (screen.orientation as any).lock) {
          ;(screen.orientation as any).lock('landscape').catch(() => {})
        }
      }
    }

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, onClick)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)
  },
})