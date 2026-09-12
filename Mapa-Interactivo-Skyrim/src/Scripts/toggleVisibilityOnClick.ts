import * as ecs from '@8thwall/ecs'

const notifyDescendants = (world: any, targetEid: any, eventName: string) => {
  if (!targetEid) return
  if (ecs.Disabled.has(world, targetEid)) return
  world.events.dispatch(targetEid, eventName, {})
  try {
    for (const child of world.getChildren(targetEid)) {
      notifyDescendants(world, child, eventName)
    }
  } catch (e) {}
}

ecs.registerComponent({
  name: 'toggleVisibilityOnClick',
  schema: {
    button: ecs.eid,
    showTarget1: ecs.eid,
    showTarget2: ecs.eid,
    hideTarget1: ecs.eid,
    hideTarget2: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const handleToggle = () => {
      console.log('[toggleVisibilityOnClick] ¡Click detectado en el botón!', eid)
      const {showTarget1, showTarget2, hideTarget1, hideTarget2} = schemaAttribute.get(eid)

      if (showTarget1) {
        ecs.Disabled.remove(world, showTarget1)
        notifyDescendants(world, showTarget1, 'start-typing')
      }
      if (showTarget2) {
        ecs.Disabled.remove(world, showTarget2)
        notifyDescendants(world, showTarget2, 'start-typing')
      }
      if (hideTarget1) {
        ecs.Disabled.set(world, hideTarget1, {})
      }
      if (hideTarget2) {
        ecs.Disabled.set(world, hideTarget2, {})
      }
    }

    const state = ecs.defineState('default')
      .initial()

    // Escucha recursiva en la entidad y todos sus hijos (textos, iconos, marcos)
    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, handleToggle)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    // 1. Escuchar en el propio eid y en todos sus hijos
    attachRecursiveClickListener(eid)

    // 2. Si se especificó una entidad botón diferente en el inspector, escuchar también en ella y sus hijos
    const {button} = schemaAttribute.get(eid)
    if (button && button !== eid) {
      attachRecursiveClickListener(button)
    }
  },
})