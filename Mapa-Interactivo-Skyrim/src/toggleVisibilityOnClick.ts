import * as ecs from '@8thwall/ecs'

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
        if (showTarget1) ecs.Disabled.remove(world, showTarget1)
        if (showTarget2) ecs.Disabled.remove(world, showTarget2)
        if (hideTarget1) ecs.Disabled.set(world, hideTarget1, {})
        if (hideTarget2) ecs.Disabled.set(world, hideTarget2, {})
      })
  },
})