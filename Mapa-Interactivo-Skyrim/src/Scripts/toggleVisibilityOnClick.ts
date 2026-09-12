import * as ecs from '@8thwall/ecs'

const notifyDescendants = (world: any, targetEid: any, eventName: string) => {
  if (!targetEid) return
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
    backgroundFrame: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const handleToggle = () => {
      console.log('[toggleVisibilityOnClick] Click detectado en el botón!', eid)
      const {showTarget1, showTarget2, hideTarget1, hideTarget2, backgroundFrame} = schemaAttribute.get(eid)

      if (showTarget1) {
        ecs.Disabled.remove(world, showTarget1)
        notifyDescendants(world, showTarget1, 'start-typing')
      }
      if (showTarget2) {
        ecs.Disabled.remove(world, showTarget2)
        notifyDescendants(world, showTarget2, 'start-typing')
      }
      if (hideTarget1) {
        ecs.Disabled.set(world, hideTarget1)
      }
      if (hideTarget2) {
        ecs.Disabled.set(world, hideTarget2)
      }
      if (backgroundFrame) {
        ecs.Ui.set(world, backgroundFrame, { backgroundOpacity: 0 })
      }
    }

    const state = ecs.defineState('default')
      .initial()

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, handleToggle)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)

    const {button} = schemaAttribute.get(eid)
    if (button && button !== eid) {
      attachRecursiveClickListener(button)
    }
  },
})
