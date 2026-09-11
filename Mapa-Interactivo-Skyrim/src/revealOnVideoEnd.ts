import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'revealOnVideoEnd',
  schema: {
    videoEntity: ecs.eid,
    revealTarget: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const {videoEntity, revealTarget} = schemaAttribute.get(eid)
    ecs.defineState('default')
      .initial()
      .listen(videoEntity, ecs.events.VIDEO_END, () => {
        ecs.Disabled.remove(world, revealTarget)
      })
  },
})