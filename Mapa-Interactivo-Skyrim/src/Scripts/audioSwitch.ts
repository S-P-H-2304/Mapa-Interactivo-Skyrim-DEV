import * as ecs from '@8thwall/ecs'

export const openPoiAudio = (world: any, ambientAudio: any, poiAudio: any) => {
  ecs.Audio.set(world, ambientAudio, {paused: true})
  ecs.Audio.set(world, poiAudio, {paused: false})
}

export const closePoiAudio = (world: any, ambientAudio: any, poiAudio: any) => {
  ecs.Audio.set(world, poiAudio, {paused: true})
  ecs.Audio.set(world, ambientAudio, {paused: false})
}