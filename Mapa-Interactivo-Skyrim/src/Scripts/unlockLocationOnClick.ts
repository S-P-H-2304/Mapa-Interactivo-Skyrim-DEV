import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'
ecs.registerComponent({
  name: 'unlockLocationOnClick',
  schema: {
    panelToHide: ecs.eid,
    backgroundFrame: ecs.eid,
    uiNuevaUbicacion: ecs.eid,
    imageElement: ecs.eid,
    nameElement: ecs.eid,
    titleElement: ecs.eid,
    // @asset
    imageSrc: ecs.string,
    locationName: ecs.string,
    titleText: ecs.string,
    // @label Duracion Fade (ms)
    fadeDuration: ecs.f32,
    // @label Duracion Espera (ms)
    holdDuration: ecs.f32,
    // @label Marcador a desbloquear
    markerToUnlock: ecs.eid,
  },
  schemaDefaults: {
    fadeDuration: 1000,
    holdDuration: 2000,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    
    const startFade = (uiEntity: any, startOp: number, endOp: number, duration: number, onComplete: () => void) => {
      if (!uiEntity) {
        if (onComplete) onComplete()
        return
      }
      if (duration <= 0) duration = 1
      
      let start: number | null = null
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        
        const currentOp = startOp + (endOp - startOp) * progress
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
      .onEnter(() => {
        const { locationName, markerToUnlock } = schemaAttribute.get(eid)
        if (locationName && markerToUnlock && dataManager.isLocationUnlocked(locationName)) {
           ecs.Disabled.remove(world, markerToUnlock)
        }
      })

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      
      state.listen(targetEid, ecs.input.UI_CLICK, () => {
        const {
          panelToHide, backgroundFrame, uiNuevaUbicacion, imageElement, nameElement, titleElement,
          imageSrc, locationName, titleText, fadeDuration, holdDuration, markerToUnlock
        } = schemaAttribute.get(eid)

        // Si la ubicación ya fue desbloqueada previamente, no volver a mostrar el banner ni cerrar el panel
        if (locationName && dataManager.isLocationUnlocked(locationName)) {
          return
        }

        if (panelToHide) ecs.Disabled.set(world, panelToHide)
        
        if (backgroundFrame) ecs.Ui.set(world, backgroundFrame, { backgroundOpacity: 0 })

        if (nameElement && locationName) {
          ecs.Ui.set(world, nameElement, { text: locationName })
        }
        if (titleElement && titleText) {
          ecs.Ui.set(world, titleElement, { text: titleText })
        } else if (titleElement) {
          ecs.Ui.set(world, titleElement, { text: "NUEVA UBICACIÓN" })
        }
        
        if (imageElement && imageSrc) {
          try {
            ecs.Ui.set(world, imageElement, { image: imageSrc })
          } catch(e) {
            console.error("Error setting image", e)
          }
        }

        // DESBLOQUEAR EL MARCADOR (Habilitarlo para que aparezca en el mapa 3D)
        if (markerToUnlock) {
          ecs.Disabled.remove(world, markerToUnlock)
        }
        
        if (locationName) {
          dataManager.unlockLocation(locationName)
        }

        // Liberar el bloqueo de playerInteraction y retornar a la música del mapa
        world.events.dispatch(world.events.globalId, 'force-location-deactivate', {})

        if (uiNuevaUbicacion) {
          ecs.Ui.set(world, uiNuevaUbicacion, { opacity: 0 })
          ecs.Disabled.remove(world, uiNuevaUbicacion)

          const fDur = fadeDuration || 1000
          const hDur = holdDuration || 2000

          startFade(uiNuevaUbicacion, 0, 1, fDur, () => {
            world.time.setTimeout(() => {
              startFade(uiNuevaUbicacion, 1, 0, fDur, () => {
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