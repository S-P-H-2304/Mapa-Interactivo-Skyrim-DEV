import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'toggleFullscreen',
  schema: {
    // @asset
    fullscreenOnIcon: ecs.string,
    // @asset
    fullscreenOffIcon: ecs.string,
  },
  schemaDefaults: {
    fullscreenOnIcon: 'assets/Iconos/UI/Fullscreen On.png',
    fullscreenOffIcon: 'assets/Iconos/UI/Fullscreen Off.png',
  },
  stateMachine: ({ world, eid, schemaAttribute }) => {
    const isFullscreen = () => {
      if (typeof document === 'undefined') return false
      return !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
    }

    const updateIcon = () => {
      const schema = schemaAttribute.get(eid)
      const icon = isFullscreen() ? schema.fullscreenOffIcon : schema.fullscreenOnIcon
      if (icon) {
        ecs.Ui.set(world, eid, { image: icon })
      }
    }

    const toggle = () => {
      if (typeof document === 'undefined') return
      
      const docEl = document.documentElement
      if (!isFullscreen()) {
        // Entrar a Fullscreen
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {})
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen()
        }
        
        // Forzar Landscape al entrar
        if (screen.orientation && (screen.orientation as any).lock) {
          ; (screen.orientation as any).lock('landscape').catch(() => { })
        }
      } else {
        // Salir de Fullscreen (sin forzar rotación)
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen()
        }
        
        // Al salir de fullscreen, el navegador suele liberar el lock de orientacion automaticamente,
        // o podemos liberarlo explícitamente si se desea, pero el requerimiento es no forzar rotacion.
        if (screen.orientation && (screen.orientation as any).unlock) {
           (screen.orientation as any).unlock()
        }
      }
    }

    const state = ecs.defineState('default')
      .initial()
      .onEnter(() => {
        if (typeof document !== 'undefined') {
          document.addEventListener('fullscreenchange', updateIcon)
          document.addEventListener('webkitfullscreenchange', updateIcon)
        }
        updateIcon() // Configurar ícono inicial
      })
      .onExit(() => {
        if (typeof document !== 'undefined') {
          document.removeEventListener('fullscreenchange', updateIcon)
          document.removeEventListener('webkitfullscreenchange', updateIcon)
        }
      })

    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, toggle)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)
  },
})
