import * as ecs from '@8thwall/ecs'
import {AUDIO_SETTINGS_CHANGED, AudioSettingsPayload} from './audioEvents'

ecs.registerComponent({
  name: 'audioManager',
  schema: {
    incButton: ecs.eid,
    decButton: ecs.eid,
    muteButton: ecs.eid,
    volumeText: ecs.eid,
    volumeStep: ecs.ui8,
    // @asset
    mutedIcon: ecs.string,
    // @asset
    unmutedIcon: ecs.string,
  },
  schemaDefaults: {
    volumeStep: 10,
  },
  data: {
    volumePercent: ecs.ui8,
    isMuted: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const {incButton, decButton, muteButton, volumeText} = schemaAttribute.get(eid)

    const applyMuteIcon = () => {
      const {isMuted} = dataAttribute.get(eid)
      const {mutedIcon, unmutedIcon} = schemaAttribute.get(eid)
      ecs.Ui.set(world, muteButton, {image: isMuted ? mutedIcon : unmutedIcon})
    }

    const broadcastAndRender = () => {
      const {volumePercent, isMuted} = dataAttribute.get(eid)
      ecs.Ui.set(world, volumeText, {text: isMuted ? 'Muted' : `${volumePercent}%`})
      applyMuteIcon()
      const payload: AudioSettingsPayload = {volumePercent, isMuted}
      world.events.dispatch(world.events.globalId, AUDIO_SETTINGS_CHANGED, payload)
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, {volumePercent: 100, isMuted: false})
        broadcastAndRender()
      })
      .listen(incButton, ecs.input.UI_CLICK, () => {
            const {volumeStep} = schemaAttribute.get(eid)
            const {volumePercent} = dataAttribute.get(eid)
            dataAttribute.set(eid, {
                volumePercent: Math.min(100, volumePercent + volumeStep),
                isMuted: false,
            })
            broadcastAndRender()
            })
            .listen(decButton, ecs.input.UI_CLICK, () => {
            const {volumeStep} = schemaAttribute.get(eid)
            const {volumePercent} = dataAttribute.get(eid)
            dataAttribute.set(eid, {
                volumePercent: Math.max(0, volumePercent - volumeStep),
                isMuted: false,
        })
        broadcastAndRender()
        })
      .listen(decButton, ecs.input.UI_CLICK, () => {
        const {volumeStep} = schemaAttribute.get(eid)
        const {volumePercent} = dataAttribute.get(eid)
        dataAttribute.set(eid, {volumePercent: Math.max(0, volumePercent - volumeStep)})
        broadcastAndRender()
      })
      .listen(muteButton, ecs.input.UI_CLICK, () => {
        const {isMuted} = dataAttribute.get(eid)
        dataAttribute.set(eid, {isMuted: !isMuted})
        broadcastAndRender()
      })
  },
})