import * as ecs from '@8thwall/ecs'
import {AUDIO_SETTINGS_CHANGED, AudioSettingsPayload} from './audioEvents'

const percentToGain = (percent: number): number => {
  if (percent <= 0) return 0
  return Math.pow(percent / 100, 2)
}

ecs.registerComponent({
  name: 'globalVolumeSync',
  stateMachine: ({world, eid}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, AUDIO_SETTINGS_CHANGED, (event) => {
        const {volumePercent, isMuted} = event.data as AudioSettingsPayload
        ecs.Audio.set(world, eid, {volume: isMuted ? 0 : percentToGain(volumePercent)})
      })
  },
})