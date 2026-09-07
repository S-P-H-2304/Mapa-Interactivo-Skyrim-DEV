import * as ecs from '@8thwall/ecs'
import {UNLOCK_TRIGGERED, UnlockPayload} from './unlockEvents'

ecs.registerComponent({
  name: 'interactionTrigger',
  schema: {
    unlockPoiId: ecs.string,   
    unlockTextId: ecs.string, 
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    ecs.defineState('default')
      .initial()
      .listen(eid, ecs.input.UI_CLICK, () => {
        console.log('click en interactionTrigger') // temporal
        const {unlockPoiId, unlockTextId} = schemaAttribute.get(eid)
        console.log('unlockTextId configurado:', unlockTextId)
        if (unlockPoiId) {
          const payload: UnlockPayload = {unlockId: unlockPoiId}
          world.events.dispatch(world.events.globalId, UNLOCK_TRIGGERED, payload)
        }
        if (unlockTextId) {
          const payload: UnlockPayload = {unlockId: unlockTextId}
          world.events.dispatch(world.events.globalId, UNLOCK_TRIGGERED, payload)
        }
      })
  },
})