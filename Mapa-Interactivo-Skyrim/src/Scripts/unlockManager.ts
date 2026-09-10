import * as ecs from '@8thwall/ecs'
import {UNLOCK_TRIGGERED, UnlockPayload} from './unlockEvents'
import {Unlockable} from './unlockable'

const unlockableQuery = ecs.defineQuery([Unlockable])

ecs.registerComponent({
  name: 'unlockManager',
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, UNLOCK_TRIGGERED, (event) => {
        const {unlockId} = event.data as UnlockPayload

        for (const poiEid of unlockableQuery(world)) {
          const {unlockId: myUnlockId} = Unlockable.get(world, poiEid)
          if (unlockId === myUnlockId) {
            ecs.Disabled.remove(world, poiEid)
          }
        }
      })
  },
})