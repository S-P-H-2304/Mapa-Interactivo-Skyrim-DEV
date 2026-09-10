import * as ecs from '@8thwall/ecs'

const notifyDescendants = (world: any, targetEid: any, eventName: string) => {
  if (!targetEid) return
  if (ecs.Disabled.has(world, targetEid)) return
  world.events.dispatch(targetEid, eventName, {})
  for (const child of world.getChildren(targetEid)) {
    notifyDescendants(world, child, eventName)
  }
}

ecs.registerComponent({
  name: 'toggleVisibilityOnClick',
  schema: {
    showTarget1: ecs.eid,
    showTarget2: ecs.eid,
    hideTarget1: ecs.eid,
    hideTarget2: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    ecs.defineState('default')
      .initial()
      .listen(eid, ecs.input.UI_CLICK, () => {
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
          console.log('OCULTANDO', hideTarget1, '— disparado por el botón', eid) // temporal
          ecs.Disabled.set(world, hideTarget1, {})
        }
        if (hideTarget2) {
          console.log('OCULTANDO', hideTarget2, '— disparado por el botón', eid) // temporal
          ecs.Disabled.set(world, hideTarget2, {})
        }
      })
  },
})