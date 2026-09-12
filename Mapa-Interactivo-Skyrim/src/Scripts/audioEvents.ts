export const AUDIO_SETTINGS_CHANGED = 'audio-settings-changed'
export const START_EXPERIENCE = 'start-experience'

export type AudioSettingsPayload = {
  volumePercent: number,
  isMuted: boolean,
}