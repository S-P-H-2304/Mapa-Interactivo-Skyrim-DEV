import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'pressHoldFeedback',
  schema: {
    // Píxeles que se desplaza hacia abajo al presionar (efecto de hundimiento)
    offsetY: ecs.f32,
    // Opacidad de fondo mientras está presionado
    pressedOpacity: ecs.f32,
  },
  schemaDefaults: {
    offsetY: 3,
    pressedOpacity: 0.8,
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    let origTop: number | null = null
    let origBottom: number | null = null
    let origOpacity = 1
    let isPressed = false

    const captureOriginals = () => {
      if (ecs.Ui.has(world, eid)) {
        const ui = ecs.Ui.get(world, eid)
        origTop = ui.top !== '' && ui.top !== undefined && ui.top !== null ? parseFloat(ui.top as any) : null
        origBottom = ui.bottom !== '' && ui.bottom !== undefined && ui.bottom !== null ? parseFloat(ui.bottom as any) : null
        origOpacity = ui.backgroundOpacity ?? 1
      }
    }

    const handlePress = () => {
      if (isPressed) return
      isPressed = true

      const { offsetY, pressedOpacity } = schemaAttribute.get(eid)
      const offset = offsetY ?? 3
      const opacity = pressedOpacity ?? 0.8

      if (ecs.Ui.has(world, eid)) {
        if (origTop === null && origBottom === null && origOpacity === 1) {
          captureOriginals()
        }

        const patch: any = {
          backgroundOpacity: opacity,
        }

        // Simular hundimiento físico desplazando hacia abajo
        if (origTop !== null) {
          patch.top = origTop + offset
        } else if (origBottom !== null) {
          patch.bottom = origBottom - offset
        }

        ecs.Ui.set(world, eid, patch)
      }
    }

    const handleRelease = () => {
      if (!isPressed) return
      isPressed = false

      if (ecs.Ui.has(world, eid)) {
        const resetPatch: any = {
          backgroundOpacity: origOpacity,
        }

        if (origTop !== null) {
          resetPatch.top = origTop
        } else if (origBottom !== null) {
          resetPatch.bottom = origBottom
        }

        ecs.Ui.set(world, eid, resetPatch)
      }
    }

    const state = ecs.defineState('default')
      .initial()
      .onEnter(() => {
        captureOriginals()
      })

    // Escuchar eventos en la entidad y recursivamente en sus hijos (icono, texto)
    const attachListeners = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_PRESSED, handlePress)
      state.listen(targetEid, ecs.input.UI_RELEASED, handleRelease)
      state.listen(targetEid, ecs.input.UI_HOVER_END, handleRelease)

      try {
        for (const child of world.getChildren(targetEid)) {
          attachListeners(child)
        }
      } catch (e) {}
    }

    attachListeners(eid)
  },
})