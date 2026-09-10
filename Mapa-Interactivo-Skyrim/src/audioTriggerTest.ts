import * as ecs from '@8thwall/ecs'
import {openPoiAudio, closePoiAudio} from './audioSwitch'

ecs.registerComponent({
  name: 'poiAudioTriggerTest',
  schema: {
    testButton: ecs.eid,
    ambientAudio: ecs.eid,
    poiAudio: ecs.eid,
  },
  data: {
    isOpen: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const {testButton, ambientAudio, poiAudio} = schemaAttribute.get(eid)

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, {isOpen: false})
      })
      .listen(testButton, ecs.input.UI_CLICK, () => {
        const {isOpen} = dataAttribute.get(eid)
        if (isOpen) {
          closePoiAudio(world, ambientAudio, poiAudio)
        } else {
          openPoiAudio(world, ambientAudio, poiAudio)
        }
        dataAttribute.set(eid, {isOpen: !isOpen})
      })
  },
})