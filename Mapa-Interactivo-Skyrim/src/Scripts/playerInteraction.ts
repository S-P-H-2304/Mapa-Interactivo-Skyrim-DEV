import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

// Flag compartido entre todas las instancias de playerInteraction.
// true = hay un panel de ciudad visible → bloquea nuevas activaciones.
let anyPanelOpen = false

ecs.registerComponent({
  name: 'playerInteraction',
  schema: {
    playerTarget: ecs.eid, // Referencia al Jugador (Image Target)
    uiPanel: ecs.eid,
    markerModel: ecs.eid,
    backgroundFrame: ecs.eid,
    // @asset
    songUrl: ecs.string,
    activationDelay: ecs.f32,
    dimOpacity: ecs.f32,
  },
  schemaDefaults: {
    activationDelay: 1000, // 1 segundo de retraso
    dimOpacity: 0.75,      // Opacidad del fondo negro al abrir el panel
  },
  data: {
    timeoutId: ecs.i32,
    isActive: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const triggerActivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = true
      data.timeoutId = 0
      anyPanelOpen = true

      // 1. Mostrar Panel de UI de la ciudad
      if (schema.uiPanel) {
        ecs.Disabled.remove(world, schema.uiPanel)
      }

      // 2. Oscurecer el fondo de UI General
      if (schema.backgroundFrame) {
        const targetDim = schema.dimOpacity ?? 0.75
        ecs.Ui.set(world, schema.backgroundFrame, { backgroundOpacity: targetDim })
      }

      // 3. Animación del marcador a "Selected"
      const modelEid = schema.markerModel || eid
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Crossfade
      const payload: LocationPayload = {
        speakerEid: eid,
        songUrl: schema.songUrl || undefined,
      }
      world.events.dispatch(world.events.globalId, LOCATION_ENTER, payload)
    }

    const triggerDeactivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = false
      anyPanelOpen = false

      // 1. Ocultar Panel de UI de la ciudad
      if (schema.uiPanel) {
        ecs.Disabled.set(world, schema.uiPanel, {})
      }

      // 2. Restaurar transparencia del fondo de UI General
      if (schema.backgroundFrame) {
        ecs.Ui.set(world, schema.backgroundFrame, { backgroundOpacity: 0 })
      }

      // 3. Animación inversa del marcador
      const modelEid = schema.markerModel || eid
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected Inverse',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Retornar a música principal
      const payload: LocationPayload = {
        speakerEid: eid,
      }
      world.events.dispatch(world.events.globalId, LOCATION_EXIT, payload)
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, { timeoutId: 0, isActive: false })
      })
      .onTick(() => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Si este marcador está activo pero su panel fue cerrado manualmente
        // (ej. el usuario presionó "Salir" sin alejar la tarjeta del marcador),
        // desactivar para liberar el bloqueo y permitir nuevas interacciones.
        if (data.isActive && schema.uiPanel && ecs.Disabled.has(world, schema.uiPanel)) {
          triggerDeactivation()
        }
      })
      .listen(eid, ecs.physics.COLLISION_START_EVENT, (event: any) => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Verificar que el objeto que colisiona es el jugador
        if (schema.playerTarget && event.data.other !== schema.playerTarget) return

        // Si hay algún panel de ciudad abierto, no activar otro
        if (anyPanelOpen) return

        if (data.isActive) return

        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        const delay = schema.activationDelay ?? 0

        if (delay <= 0) {
          triggerActivation()
        } else {
          const newTimeoutId = world.time.setTimeout(() => {
            const d = dataAttribute.cursor(eid)
            // Verificar por si un panel se abrió durante el delay
            if (d.timeoutId !== 0 && !anyPanelOpen) {
              triggerActivation()
            }
          }, delay)
          data.timeoutId = newTimeoutId
        }
      })
      .listen(eid, ecs.physics.COLLISION_END_EVENT, (event: any) => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Ignorar salidas si no es el jugador
        if (schema.playerTarget && event.data.other !== schema.playerTarget) return

        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        if (data.isActive) {
          triggerDeactivation()
        }
      })
      .onExit(() => {
        const data = dataAttribute.get(eid)
        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
        }
      })
  },
})