import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'startExperience',
  schema: {
    // @label Panel de Instrucciones
    instructionsPanel: ecs.eid,
    // @label Entidad del Video (Splash Screen)
    videoOverlayEntity: ecs.eid,
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    const state = ecs.defineState('default').initial()

    const onClick = () => {
      console.log('[startExperience] onClick triggered')
      const schema = schemaAttribute.get(eid)

      if (schema.instructionsPanel) {
        ecs.Disabled.set(world, schema.instructionsPanel)
        try {
          ecs.Hidden.set(world, schema.instructionsPanel)
        } catch(e) {}
      }

      // Activar Fullscreen y Landscape
      if (typeof document !== 'undefined') {
        const docEl = document.documentElement
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => { })
          } else if ((docEl as any).webkitRequestFullscreen) {
            ; (docEl as any).webkitRequestFullscreen()
          }
        }
        if (screen.orientation && (screen.orientation as any).lock) {
          ; (screen.orientation as any).lock('landscape').catch(() => { })
        }
      }

      // Disparar evento para iniciar el video
      if (schema.videoOverlayEntity) {
        console.log('[startExperience] Removing disabled from videoOverlayEntity')
        ecs.Disabled.remove(world, schema.videoOverlayEntity)
        
        // Esperamos 1 frame para asegurar que el componente del video se haya inicializado
        world.time.setTimeout(() => {
           console.log('[startExperience] Dispatching start-video')
           world.events.dispatch(schema.videoOverlayEntity, 'start-video', {})
        }, 16)
      }
    }

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, onClick)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) { }
    }

    attachRecursiveClickListener(eid)
  },
})
