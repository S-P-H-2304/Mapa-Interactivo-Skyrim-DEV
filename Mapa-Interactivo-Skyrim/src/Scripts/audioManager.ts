import * as ecs from '@8thwall/ecs'
import { AUDIO_SETTINGS_CHANGED, AudioSettingsPayload } from './audioEvents'

export const LOCATION_ENTER = 'location-enter'
export const LOCATION_EXIT = 'location-exit'

export type LocationPayload = {
  songUrl?: string
  speakerEid?: any
}

ecs.registerComponent({
  name: 'audioManager',
  schema: {
    incButton: ecs.eid,
    decButton: ecs.eid,
    muteButton: ecs.eid,
    volumeText: ecs.eid,
    volumeStep: ecs.ui8,
    initialVolume: ecs.ui8,
    // @asset
    mutedIcon: ecs.string,
    // @asset
    unmutedIcon: ecs.string,

    mainAudioPlayer: ecs.eid,
    locationAudioPlayer: ecs.eid,
    fadeDuration: ecs.f32,
  },
  schemaDefaults: {
    volumeStep: 10,
    initialVolume: 50,
    fadeDuration: 1000,
  },
  data: {
    volumePercent: ecs.ui8,
    isMuted: ecs.boolean,
    activePlayerType: ecs.string,
    fadeIntervalId: ecs.i32,
    activeSpeakerEid: ecs.eid,
  },
  stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
    const { incButton, decButton, muteButton, volumeText } = schemaAttribute.get(eid)

    const applyMuteIcon = () => {
      const { isMuted } = dataAttribute.get(eid)
      const { mutedIcon, unmutedIcon } = schemaAttribute.get(eid)
      const icon = isMuted ? mutedIcon : unmutedIcon
      if (!muteButton) return

      if (ecs.Ui.has(world, muteButton)) {
        ecs.Ui.set(world, muteButton, { image: icon })
      }
      try {
        for (const child of world.getChildren(muteButton)) {
          if (ecs.Ui.has(world, child)) {
            ecs.Ui.set(world, child, { image: icon })
          }
        }
      } catch (e) { }
    }

    const getMainPlayerEid = (schema: any) => schema.mainAudioPlayer || eid

    const syncMasterVolume = () => {
      const data = dataAttribute.cursor(eid)
      const schema = schemaAttribute.cursor(eid)
      const mainPlayer = getMainPlayerEid(schema)

      const masterVol = data.isMuted ? 0 : (data.volumePercent / 100)
      const currentSpeaker = data.activeSpeakerEid || schema.locationAudioPlayer

      if (data.activePlayerType === 'main' && mainPlayer) {
        ecs.Audio.set(world, mainPlayer, { volume: masterVol })
      } else if (data.activePlayerType === 'location' && currentSpeaker) {
        ecs.Audio.set(world, currentSpeaker, { volume: masterVol })
      }
    }

    const broadcastAndRender = () => {
      const { volumePercent, isMuted } = dataAttribute.get(eid)
      if (volumeText) {
        ecs.Ui.set(world, volumeText, { text: isMuted ? 'Muted' : `${volumePercent}%` })
      }
      applyMuteIcon()
      syncMasterVolume()

      const payload: AudioSettingsPayload = { volumePercent, isMuted }
      world.events.dispatch(world.events.globalId, AUDIO_SETTINGS_CHANGED, payload)
    }

    const startFade = (targetPlayerType: string, newUrl?: string, customSpeakerEid?: any) => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      const { fadeDuration, locationAudioPlayer } = schema

      if (data.fadeIntervalId !== 0) {
        world.time.clearTimeout(data.fadeIntervalId)
        data.fadeIntervalId = 0
      }

      const mainPlayer = getMainPlayerEid(schema)
      const targetSpeaker = customSpeakerEid || data.activeSpeakerEid || locationAudioPlayer

      const fadeOutEid = targetPlayerType === 'main' ? (data.activeSpeakerEid || locationAudioPlayer) : mainPlayer
      const fadeInEid = targetPlayerType === 'main' ? mainPlayer : targetSpeaker

      if (!fadeOutEid || !fadeInEid) return

      if (targetPlayerType === 'location') {
        data.activeSpeakerEid = targetSpeaker

        if (newUrl && (!ecs.Audio.has(world, targetSpeaker) || ecs.Audio.get(world, targetSpeaker).url !== newUrl)) {
          if (ecs.Audio.has(world, targetSpeaker)) {
            ecs.Audio.remove(world, targetSpeaker)
          }

          ecs.Audio.set(world, targetSpeaker, {
            url: newUrl,
            volume: 0.01,
            paused: false,
            loop: true,
            positional: false,
          })
        } else if (ecs.Audio.has(world, targetSpeaker)) {
          ecs.Audio.set(world, targetSpeaker, { paused: false })
        }
      } else if (targetPlayerType === 'main') {
        ecs.Audio.set(world, mainPlayer, { paused: false })
      }

      const tickMs = 50
      const steps = Math.max(1, Math.floor(fadeDuration / tickMs))
      let currentStep = 0

      const newInterval = world.time.setInterval(() => {
        const d = dataAttribute.cursor(eid)
        const s = schemaAttribute.cursor(eid)

        currentStep++
        const progress = Math.min(1, currentStep / steps)
        const masterVol = d.isMuted ? 0 : (d.volumePercent / 100)

        const fadeInVol = masterVol * progress
        const fadeOutVol = masterVol * (1 - progress)

        const currentMain = getMainPlayerEid(s)
        const currentLoc = d.activeSpeakerEid || s.locationAudioPlayer

        const fIn = targetPlayerType === 'main' ? currentMain : currentLoc
        const fOut = targetPlayerType === 'main' ? currentLoc : currentMain

        if (fIn) {
          ecs.Audio.mutate(world, fIn, (cursor) => {
            cursor.volume = Math.max(0.01, fadeInVol)
            cursor.paused = false
          })
        }
        if (fOut) {
          ecs.Audio.mutate(world, fOut, (cursor) => {
            cursor.volume = fadeOutVol
          })
        }

        if (currentStep >= steps) {
          world.time.clearTimeout(d.fadeIntervalId)
          d.fadeIntervalId = 0

          if (fIn) {
            ecs.Audio.mutate(world, fIn, (cursor) => {
              cursor.volume = masterVol
              cursor.paused = false
            })
          }
          if (fOut) {
            ecs.Audio.mutate(world, fOut, (cursor) => {
              cursor.volume = 0
              cursor.paused = true
            })
          }
        }
      }, tickMs)

      data.fadeIntervalId = newInterval
      data.activePlayerType = targetPlayerType
    }

    const state = ecs.defineState('default')
      .initial()
      .onEnter(() => {
        const schema = schemaAttribute.get(eid)
        const startingVol = schema.initialVolume !== undefined && schema.initialVolume !== null ? schema.initialVolume : 50
        dataAttribute.set(eid, { volumePercent: startingVol, isMuted: false, activePlayerType: 'main', fadeIntervalId: 0 })
        broadcastAndRender()

        const initialMainPlayer = getMainPlayerEid(schema)
        if (initialMainPlayer) ecs.Audio.set(world, initialMainPlayer, { paused: false })
      })

    const attachRecursiveClickListener = (targetEid: any, onClick: () => void) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, onClick)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child, onClick)
        }
      } catch (e) {}
    }

    const handleInc = () => {
      const { volumeStep } = schemaAttribute.get(eid)
      const { volumePercent } = dataAttribute.get(eid)
      dataAttribute.set(eid, {
        volumePercent: Math.min(100, volumePercent + volumeStep),
        isMuted: false,
      })
      broadcastAndRender()
    }

    const handleDec = () => {
      const { volumeStep } = schemaAttribute.get(eid)
      const { volumePercent } = dataAttribute.get(eid)
      const next = Math.max(0, volumePercent - volumeStep)
      dataAttribute.set(eid, {
        volumePercent: next,
        isMuted: next <= 0,
      })
      broadcastAndRender()
    }

    const handleMute = () => {
      const { isMuted } = dataAttribute.get(eid)
      dataAttribute.set(eid, { isMuted: !isMuted })
      broadcastAndRender()
    }

    attachRecursiveClickListener(incButton, handleInc)
    attachRecursiveClickListener(decButton, handleDec)
    attachRecursiveClickListener(muteButton, handleMute)

    state
      .listen(world.events.globalId, LOCATION_ENTER, (event) => {
        const payload = event.data as LocationPayload
        startFade('location', payload?.songUrl, payload?.speakerEid)
      })
      .listen(world.events.globalId, LOCATION_EXIT, (event) => {
        const payload = event.data as LocationPayload
        startFade('main', undefined, payload?.speakerEid)
      })
      .onExit(() => {
        const { fadeIntervalId } = dataAttribute.get(eid)
        if (fadeIntervalId !== 0) {
          world.time.clearTimeout(fadeIntervalId)
        }
      })
  },
})