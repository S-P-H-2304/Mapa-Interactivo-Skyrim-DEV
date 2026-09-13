import * as ecs from '@8thwall/ecs'

const AUDIO_SETTINGS_CHANGED = 'audioManager.settingsChanged'

ecs.registerComponent({
  name: 'uiSoundOnClick',
  schema: {
    // @asset
    soundFile: ecs.string,
  },
  schemaDefaults: {},
  data: {
    volume: ecs.f32,
    isMuted: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    
    // Initial global volume state (assume 50% until we hear otherwise)
    dataAttribute.set(eid, { volume: 0.5, isMuted: false })

    const state = ecs.defineState('idle').initial()
    
    // Listen to global volume changes
    state.listen(world.events.globalId, AUDIO_SETTINGS_CHANGED, (e) => {
      const payload = e.data as { volumePercent: number, isMuted: boolean }
      if (payload) {
        dataAttribute.set(eid, {
          volume: payload.volumePercent / 100,
          isMuted: payload.isMuted
        })
      }
    })

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      
      state.listen(targetEid, ecs.input.UI_CLICK, () => {
        const { soundFile } = schemaAttribute.get(eid)
        const { volume, isMuted } = dataAttribute.get(eid)
        
        if (soundFile && !isMuted && volume > 0) {
          try {
            const audio = new Audio(soundFile)
            audio.volume = volume
            audio.play()
          } catch (err) {
            console.error('Error playing UI sound', err)
          }
        }
      })

      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)
  },
})
