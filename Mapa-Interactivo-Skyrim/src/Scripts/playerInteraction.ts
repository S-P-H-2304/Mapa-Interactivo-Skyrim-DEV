import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

ecs.registerComponent({
  name: 'playerInteraction',
  schema: {
    playerTarget: ecs.eid, // Referencia al Jugador (Image Target)
    uiPanel: ecs.eid,
    markerModel: ecs.eid,
    generalUi: ecs.eid,
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

      // 1. Mostrar Panel de UI de la ciudad
      if (schema.uiPanel) {
        ecs.Disabled.remove(world, schema.uiPanel)
      }

      // 2. Oscurecer el fondo de UI General
      if (schema.generalUi) {
        const targetDim = schema.dimOpacity ?? 0.75
        ecs.Ui.set(world, schema.generalUi, { backgroundOpacity: targetDim })
      }

      // 3. Animación del marcador a "Selected" (usa eid si está puesto directo en el GLB)
      const modelEid = schema.markerModel || eid
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Crossfade (el GLB actúa de speaker)
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

      // 1. Ocultar Panel de UI de la ciudad
      if (schema.uiPanel) {
        ecs.Disabled.set(world, schema.uiPanel, {})
      }

      // 2. Restaurar transparencia del fondo de UI General
      if (schema.generalUi) {
        ecs.Ui.set(world, schema.generalUi, { backgroundOpacity: 0 })
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
      .listen(eid, ecs.physics.COLLISION_START_EVENT, (event: any) => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Verificar que el objeto que colisiona es el jugador
        if (schema.playerTarget && event.data.other !== schema.playerTarget) return

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
            if (d.timeoutId !== 0) {
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

