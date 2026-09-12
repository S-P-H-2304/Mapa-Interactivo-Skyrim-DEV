import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

ecs.registerComponent({
  name: 'playerInteractionTest',
  schema: {
    button: ecs.eid,
    uiPanel: ecs.eid,
    markerModel: ecs.eid,
    generalUi: ecs.eid,
    // @asset
    songUrl: ecs.string,
    dimOpacity: ecs.f32,
  },
  schemaDefaults: {
    dimOpacity: 0.75,
  },
  data: {
    isActive: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const triggerActivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = true

      // 1. Mostrar Panel de UI
      if (schema.uiPanel) {
        ecs.Disabled.remove(world, schema.uiPanel)
      }

      // 2. Oscurecer fondo de UI General
      if (schema.generalUi) {
        const targetDim = schema.dimOpacity ?? 0.75
        ecs.Ui.set(world, schema.generalUi, { backgroundOpacity: targetDim })
      }

      // 3. Animación del marcador a "Selected"
      const modelEid = schema.markerModel
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Crossfade
      const speaker = schema.markerModel || eid
      const payload: LocationPayload = {
        speakerEid: speaker,
        songUrl: schema.songUrl || undefined,
      }
      world.events.dispatch(world.events.globalId, LOCATION_ENTER, payload)
    }

    const triggerDeactivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = false

      // 1. Ocultar Panel de UI
      if (schema.uiPanel) {
        ecs.Disabled.set(world, schema.uiPanel, {})
      }

      // 2. Restaurar transparencia del fondo de UI General
      if (schema.generalUi) {
        ecs.Ui.set(world, schema.generalUi, { backgroundOpacity: 0 })
      }

      // 3. Animación inversa del marcador
      const modelEid = schema.markerModel
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected Inverse',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Retornar a música principal
      const speaker = schema.markerModel || eid
      const payload: LocationPayload = {
        speakerEid: speaker,
      }
      world.events.dispatch(world.events.globalId, LOCATION_EXIT, payload)
    }

    const handleToggle = () => {
      const { isActive } = dataAttribute.get(eid)
      if (!isActive) {
        triggerActivation()
      } else {
        triggerDeactivation()
      }
    }

    const state = ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, { isActive: false })
      })

    // Detección recursiva de clics en el botón y todos sus hijos (textos, iconos)
    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, handleToggle)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    // Escuchar en el propio eid
    attachRecursiveClickListener(eid)

    // Y si se asignó una entidad botón diferente en el inspector, escuchar también en ella
    const { button } = schemaAttribute.get(eid)
    if (button && button !== eid) {
      attachRecursiveClickListener(button)
    }
  },
})
