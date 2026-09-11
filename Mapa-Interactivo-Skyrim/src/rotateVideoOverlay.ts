import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'rotateVideoOverlay',
  schema: {
    // @asset
    videoSrc: ecs.string,
    instructionsPanel: ecs.eid,
  },
  add: (world, component) => {
    const {videoSrc, instructionsPanel} = component.schema

    ecs.assets.load({url: videoSrc}).then((asset) => {
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
      video.play().catch((err) => console.warn('Autoplay falló:', err))

      video.addEventListener('ended', () => {
        video.remove()
        ecs.Disabled.remove(world, instructionsPanel)
      })
    })
  },
})