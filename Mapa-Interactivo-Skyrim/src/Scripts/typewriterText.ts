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

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
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
              // Habilitarlo temporalmente para que pueda escuchar el evento
              ecs.Disabled.remove(world, enableTarget)
              try { ecs.Ui.set(world, enableTarget, { opacity: 0 }) } catch(e) {}
              
              // Simular el clic en el botón de continuar para desencadenar que aparezca la siguiente página
              world.time.setTimeout(() => {
                  world.events.dispatch(enableTarget, ecs.input.UI_CLICK, {})
                  // Ahora sí lo deshabilitamos para que no interfiera más
                  ecs.Disabled.set(world, enableTarget)
              }, 50)
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
        const {hasPlayedOnce, fullText} = dataAttribute.get(eid)
        if (hasPlayedOnce) return
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

        const {charIntervalMs, enableTarget} = schemaAttribute.get(eid)
        let newMs = msSinceLastChar + world.time.delta
        let newVisible = visibleChars

        while (newMs >= charIntervalMs && newVisible < fullText.length) {
          newMs -= charIntervalMs
          newVisible += 1
        }

        ecs.Ui.set(world, eid, {text: fullText.slice(0, newVisible)})
        
        const finished = newVisible >= fullText.length

        dataAttribute.set(eid, {
          fullText,
          msSinceLastChar: newMs,
          visibleChars: newVisible,
          hasPlayedOnce: true,
          isTyping: !finished,
        })

        // Cuando recién terminamos de escribir todo el texto:
        if (finished) {
          stopAudio()

          if (enableTarget) {
            // Quitamos el disabled del botón/objetivo
            ecs.Disabled.remove(world, enableTarget)
            // Nos aseguramos de iniciar su opacidad en 0 para hacerle un pequeño fade in
            ecs.Ui.set(world, enableTarget, { opacity: 0 })
            startFadeIn(enableTarget)
          }
        }
      })
      .onExit(() => {
        stopAudio()
      })
  },
})
