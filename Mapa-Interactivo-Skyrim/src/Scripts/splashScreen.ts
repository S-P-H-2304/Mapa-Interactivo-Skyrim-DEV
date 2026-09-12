import * as ecs from '@8thwall/ecs'
import { START_EXPERIENCE } from './audioEvents'

ecs.registerComponent({
  name: 'rotateVideoOverlay',
  schema: {
    // @asset
    videoSrc: ecs.string,
    // @label Panel de UI General
    generalUiPanel: ecs.eid,
    // @label Fondo Oscuro
    backgroundFrame: ecs.eid,
    // @label Audio Principal / Ambiental
    ambientAudio: ecs.eid,
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    ecs.defineState('default')
      .initial()
      .listen(eid, 'start-video', () => {
        // Regla crAtica: Adquirir cursor fresco
        const schema = schemaAttribute.get(eid)
        const { videoSrc, generalUiPanel, backgroundFrame, ambientAudio } = schema

        if (!videoSrc) return

        ecs.assets.load({ url: videoSrc }).then((asset) => {
          const video = document.createElement('video')
          video.src = asset.localUrl
          video.crossOrigin = 'anonymous'
          video.autoplay = true
          video.muted = true
          video.playsInline = true
          video.style.position = 'absolute'
          video.style.top = '0'
          video.style.left = '0'
          video.style.width = '100vw'
          video.style.height = '100vh'
          video.style.zIndex = '9999'
          video.style.objectFit = 'cover'

          document.body.appendChild(video)
          video.play().catch((err) => console.warn('Autoplay fallA3:', err))

          video.addEventListener('ended', () => {
            video.remove()

            // Ya que el video ha terminado, necesitamos volver a leer el schema fresco 
            // porque estamos dentro de OTRO callback asAncrono!
            const freshSchema = schemaAttribute.get(eid)

            if (freshSchema.generalUiPanel) {
              ecs.Disabled.remove(world, freshSchema.generalUiPanel)
              try { ecs.Hidden.remove(world, freshSchema.generalUiPanel) } catch(e) {}
            }

            if (freshSchema.backgroundFrame) {
              ecs.Ui.set(world, freshSchema.backgroundFrame, { backgroundOpacity: 0 })
            }

            if (freshSchema.ambientAudio && ecs.Audio.has(world, freshSchema.ambientAudio)) {
              ecs.Audio.mutate(world, freshSchema.ambientAudio, (cursor) => {
                cursor.paused = false
              })
            }
            
            world.events.dispatch(world.events.globalId, START_EXPERIENCE, {})
          })
        })
      })
  },
})
