import * as ecs from '@8thwall/ecs'

export const Unlockable = ecs.registerComponent({
  name: 'unlockable',
  schema: {
    unlockId: ecs.string,
  },
})