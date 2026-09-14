import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'
ecs.registerComponent({
  name: 'typewriterText',
  schema: {
    charIntervalMs: ecs.f32,
    // @label Activar al terminar
    enableTarget: ecs.eid,
    // @label Audio de Escritura
    // @asset
    typingAudio: ecs.string,
    // @label Volumen del Audio
    audioVolume: ecs.f32,
  },
  schemaDefaults: {
    charIntervalMs: 40,
    typingAudio: 'assets/Sonido/Efectos de Sonido/Writing.mp3',
    audioVolume: 0.8,
  },
  data: {
    fullText: ecs.string,
    visibleChars: ecs.ui32,
    msSinceLastChar: ecs.f32,
    hasPlayedOnce: ecs.boolean,
    isTyping: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    
    // Función auxiliar para un fade in suave del objetivo
    const startFadeIn = (targetEid: any) => {
      if (!targetEid) return
      let start: number | null = null
      const duration = 500 // medio segundo
      
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        
        ecs.Ui.set(world, targetEid, { opacity: progress })
        
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
    }

    const startAudio = () => {
      const { typingAudio, audioVolume } = schemaAttribute.get(eid)
      const audioUrl = typingAudio || 'assets/Sonido/Efectos de Sonido/Writing.mp3'
      const volume = audioVolume !== undefined && audioVolume !== null ? audioVolume : 0.8

      if (ecs.Audio.has(world, eid)) {
        ecs.Audio.mutate(world, eid, (cursor) => {
          cursor.url = audioUrl
          cursor.volume = volume
          cursor.loop = true
          cursor.paused = false
        })
      } else {
        ecs.Audio.set(world, eid, {
          url: audioUrl,
          volume,
          loop: true,
          paused: false,
          positional: false,
        })
      }
    }

    const stopAudio = () => {
      if (ecs.Audio.has(world, eid)) {
        ecs.Audio.mutate(world, eid, (cursor) => {
          cursor.paused = true
        })
      }
    }

    const completeTyping = (instant: boolean = false) => {
      const { fullText } = dataAttribute.get(eid)
      if (!fullText) return

      stopAudio()

      dataAttribute.set(eid, {
        fullText,
        visibleChars: fullText.length,
        msSinceLastChar: 0,
        hasPlayedOnce: true,
        isTyping: false,
      })

      ecs.Ui.set(world, eid, { text: fullText })

      const { enableTarget } = schemaAttribute.get(eid)
      if (enableTarget) {
        if (instant) {
          // Si el texto se saltó mediante clic/toque, retrasamos brevemente la activación del botón
          // para evitar que este mismo evento active accidentalmente el botón de continuar
          world.time.setTimeout(() => {
            if (!ecs.Disabled.has(world, eid)) {
              ecs.Disabled.remove(world, enableTarget)
              ecs.Ui.set(world, enableTarget, { opacity: 0 })
              startFadeIn(enableTarget)
            }
          }, 150)
        } else {
          ecs.Disabled.remove(world, enableTarget)
          ecs.Ui.set(world, enableTarget, { opacity: 0 })
          startFadeIn(enableTarget)
        }
      }
    }

    const handleSkip = () => {
      if (ecs.Disabled.has(world, eid)) return
      const data = dataAttribute.get(eid)
      if (!data || !data.isTyping) return
      if (!data.fullText || data.visibleChars >= data.fullText.length) return

      completeTyping(true)
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('pointerdown', handleSkip, true)
          window.addEventListener('pointerdown', handleSkip, true)
        }

        const currentData = dataAttribute.get(eid)
        const uiText = ecs.Ui.get(world, eid).text || ''
        const fullText = (currentData.fullText && currentData.fullText.length >= uiText.length)
          ? currentData.fullText
          : uiText

        const textId = fullText.slice(0, 30).trim()
        const isCompleted = textId ? dataManager.isTextCompleted(textId) : false

        if (isCompleted) {
           dataAttribute.set(eid, {
             fullText,
             visibleChars: fullText.length,
             msSinceLastChar: 0,
             hasPlayedOnce: true,
             isTyping: false,
           })
           ecs.Ui.set(world, eid, { text: fullText })

           const { enableTarget } = schemaAttribute.get(eid)
           if (enableTarget) {
              // Si el texto ya fue leído y completado, el botón de continuar correspondiente permanece deshabilitado
              ecs.Disabled.set(world, enableTarget)
           }
        } else {
           dataAttribute.set(eid, {
             fullText,
             visibleChars: 0,
             msSinceLastChar: 0,
             hasPlayedOnce: false,
             isTyping: false,
           })

           const { enableTarget } = schemaAttribute.get(eid)
           if (enableTarget && textId) {
              // Si el usuario hace clic en continuar, guardamos que terminó este texto
              world.events.addListener(enableTarget, ecs.input.UI_CLICK, () => {
                 dataManager.markTextCompleted(textId)
              })
           }
        }
      })
      .listen(eid, 'start-typing', () => {
        const {isTyping, fullText} = dataAttribute.get(eid)
        if (isTyping) return
        const textId = fullText.slice(0, 30).trim()
        if (textId && dataManager.isTextCompleted(textId)) return
        const shouldType = fullText.length > 0
        dataAttribute.set(eid, {
          fullText,
          visibleChars: 0,
          msSinceLastChar: 0,
          hasPlayedOnce: true,
          isTyping: shouldType,
        })
        ecs.Ui.set(world, eid, {text: ''})
        if (shouldType) {
          startAudio()
        }
      })
      .listen(eid, ecs.input.UI_CLICK, () => {
        handleSkip()
      })
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, () => {
        handleSkip()
      })
      .onTick(() => {
        const {fullText, visibleChars, msSinceLastChar, isTyping} = dataAttribute.get(eid)
        if (visibleChars >= fullText.length) {
          if (isTyping) {
            dataAttribute.set(eid, {
              fullText,
              visibleChars,
              msSinceLastChar,
              hasPlayedOnce: true,
              isTyping: false,
            })
            stopAudio()
          }
          return
        }

        // Si comienza a escribir
        if (!isTyping) {
          dataAttribute.set(eid, {
            fullText,
            visibleChars,
            msSinceLastChar,
            hasPlayedOnce: true,
            isTyping: true,
          })
          startAudio()
        }

        const {charIntervalMs} = schemaAttribute.get(eid)
        const interval = Math.max(charIntervalMs || 40, 1)
        let newMs = msSinceLastChar + world.time.delta
        let newVisible = visibleChars

        while (newMs >= interval && newVisible < fullText.length) {
          newMs -= interval
          newVisible += 1
        }

        ecs.Ui.set(world, eid, {text: fullText.slice(0, newVisible)})
        
        const finished = newVisible >= fullText.length

        if (finished) {
          completeTyping(false)
        } else {
          dataAttribute.set(eid, {
            fullText,
            msSinceLastChar: newMs,
            visibleChars: newVisible,
            hasPlayedOnce: true,
            isTyping: true,
          })
        }
      })
      .onExit(() => {
        stopAudio()
        if (typeof window !== 'undefined') {
          window.removeEventListener('pointerdown', handleSkip, true)
        }
      })
  },
})
