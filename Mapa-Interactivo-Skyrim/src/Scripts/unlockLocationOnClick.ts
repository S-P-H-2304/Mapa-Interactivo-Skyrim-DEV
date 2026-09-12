import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'unlockLocationOnClick',
  schema: {
    panelToHide: ecs.eid,
    backgroundFrame: ecs.eid,
    uiNuevaUbicacion: ecs.eid,
    imageElement: ecs.eid,
    nameElement: ecs.eid,
    // @asset
    imageSrc: ecs.string,
    locationName: ecs.string,
    // @label Duración Fade (ms)
    fadeDuration: ecs.f32,
    // @label Duración Espera (ms)
    holdDuration: ecs.f32,
  },
  schemaDefaults: {
    fadeDuration: 1000,
    holdDuration: 2000,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    
    // Función auxiliar para animar opacidad usando requestAnimationFrame (súper fluido y global)
    const startFade = (uiEntity: any, startOp: number, endOp: number, duration: number, onComplete: () => void) => {
      if (!uiEntity) {
        if (onComplete) onComplete()
        return
      }
      if (duration <= 0) duration = 1 // Evitar división por 0
      
      let start: number | null = null
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        
        const currentOp = startOp + (endOp - startOp) * progress
        // Nota: uiEntity es un eid numérico, totalmente seguro dentro de callbacks asíncronos
        ecs.Ui.set(world, uiEntity, { opacity: currentOp })
        
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          if (onComplete) onComplete()
        }
      }
      requestAnimationFrame(step)
    }

    const state = ecs.defineState('idle').initial()

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      
      state.listen(targetEid, ecs.input.UI_CLICK, () => {
        const {
          panelToHide, backgroundFrame, uiNuevaUbicacion, imageElement, nameElement, 
          imageSrc, locationName, fadeDuration, holdDuration
        } = schemaAttribute.get(eid)

        // 1. Ocultar Rumor
        if (panelToHide) ecs.Disabled.set(world, panelToHide)
        
        // 2. Fondo general a 0
        if (backgroundFrame) ecs.Ui.set(world, backgroundFrame, { backgroundOpacity: 0 })

        // 3. Modificar Textos e Imágenes del nuevo panel
        if (nameElement && locationName) {
          ecs.Ui.set(world, nameElement, { text: locationName })
        }
        if (imageElement && imageSrc) {
          try {
            ecs.Ui.set(world, imageElement, { image: imageSrc })
          } catch(e) {
            console.error("Error setting image", e)
          }
        }

        // 4. Mostrar panel de Nueva Ubicación e iniciar cadena de Fades
        if (uiNuevaUbicacion) {
          // Aseguramos que inicie en 0 y lo activamos
          ecs.Ui.set(world, uiNuevaUbicacion, { opacity: 0 })
          ecs.Disabled.remove(world, uiNuevaUbicacion)

          const fDur = fadeDuration || 1000
          const hDur = holdDuration || 2000

          // Fase 1: Fade IN
          startFade(uiNuevaUbicacion, 0, 1, fDur, () => {
            // Fase 2: Espera (Hold)
            world.time.setTimeout(() => {
              // Fase 3: Fade OUT
              startFade(uiNuevaUbicacion, 1, 0, fDur, () => {
                // Al terminar, desactivamos el panel completamente
                ecs.Disabled.set(world, uiNuevaUbicacion)
              })
            }, hDur)
          })
        }
      })

      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)
  },
})
