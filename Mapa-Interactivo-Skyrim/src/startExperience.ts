import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'startExperience',
  schema: {
    instructionsPanel: ecs.eid,
    ambientAudio: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const {instructionsPanel, ambientAudio} = schemaAttribute.get(eid)
    ecs.defineState('default')
      .initial()
      .listen(eid, ecs.input.UI_CLICK, () => {
        ecs.Disabled.set(world, instructionsPanel, {})
        ecs.Audio.set(world, ambientAudio, {paused: false})
      })
  },
})