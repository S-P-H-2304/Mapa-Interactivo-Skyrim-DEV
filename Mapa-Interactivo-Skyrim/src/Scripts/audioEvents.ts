export const AUDIO_SETTINGS_CHANGED = 'audio-settings-changed'

export type AudioSettingsPayload = {
  volumePercent: number,
  isMuted: boolean,
}