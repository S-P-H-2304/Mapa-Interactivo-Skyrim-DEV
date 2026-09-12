import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

ecs.registerComponent({
  name: 'audioToggle',
  schema: {
    // @asset
    songUrl: ecs.string,
    activationDelay: ecs.f32,
  },
  schemaDefaults: {
    activationDelay: 1000,
  },
  data: {
    timeoutId: ecs.i32,
    isActive: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const triggerEnter = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = true
      data.timeoutId = 0

      const payload: LocationPayload = {
        speakerEid: eid,
        songUrl: schema.songUrl || undefined,
      }
      world.events.dispatch(world.events.globalId, LOCATION_ENTER, payload)
    }

    const triggerExit = () => {
      const data = dataAttribute.cursor(eid)
      data.isActive = false

      const payload: LocationPayload = {
        speakerEid: eid,
      }
      world.events.dispatch(world.events.globalId, LOCATION_EXIT, payload)
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, { timeoutId: 0, isActive: false })
      })
      .listen(eid, ecs.physics.COLLISION_START_EVENT, () => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        if (data.isActive) return

        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        const delay = schema.activationDelay ?? 0

        if (delay <= 0) {
          triggerEnter()
        } else {
          const newTimeout = world.time.setTimeout(() => {
            const d = dataAttribute.cursor(eid)
            if (d.timeoutId !== 0) {
              triggerEnter()
            }
          }, delay)
          data.timeoutId = newTimeout
        }
      })
      .listen(eid, ecs.physics.COLLISION_END_EVENT, () => {
        const data = dataAttribute.cursor(eid)

        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        if (data.isActive) {
          triggerExit()
        }
      })
      .onExit(() => {
        const data = dataAttribute.get(eid)
        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
        }
      })
  },
})
