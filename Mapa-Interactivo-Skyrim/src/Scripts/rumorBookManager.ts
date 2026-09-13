import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

export const OPEN_RUMOR_EVENT = 'OPEN_RUMOR'

const RUMOR_TEXTS: Record<string, string[]> = {
  'Gruta': [
    "Al llegar a la gruta, un aullido y un grito de auxilio te hace estremecer. Al interior de la gruta te espera una cacería de vida o muerte. Te verás cara a cara contra la bestia asesina de Lavinia.",
    "La decisión está en tus manos, Sangre de Dragón, ¿eliminaste a la bestia o la ayudaste a eliminar a los cazadores que la atacaban? Sea como sea, Hircine está satisfecho y una grata recompensa te espera...\nQue la bendición de Hircine guíe tus garras y que tu presa nunca escape de tu vista."
  ],
  'Falkreath': [
    "Al entrar a Falkreath escuchas recitar unos ritos funerarios. Al acercarte, ves a una afligida pareja llorando frente a una tumba. Preguntas qué pasó y te hablan del asesinato de su pequeña hija, Lavinia a manos de Sinding que está encerrado en los cuarteles.",
    "Decides ir a la celda a escuchar a Sinding. Cuando hablas con él sobre el ataque, te menciona un anillo maldito que lo obligó a cometer el crimen. Sinding te entrega el anillo y te pide que lo ayudes a eliminar la maldición...",
    "...pero ten cuidado, ¡el anillo está maldito y podrías transformarte en una bestia en cualquier momento! Al salir de los cuarteles ves un ciervo blanco. Un instinto te pide que lo caces.",
    "Cuando lo mates, el espíritu de Hircine se manifestará y te pedirá que cumplas una cacería por él."
  ],
  'Túmulo': [
    "Aún no eres un miembro pleno de Los Compañeros. \n\nFuiste enviado a este lugar para recuperar un fragmento de la legendaria hacha Wuuthrad, que perteneció a Ysgramor. Farkas te acompañará en esta misión como tu compañero de escudo.",
    "Haces un dueto perfecto con Farkas. \nLlegan a una habitación con una reja cerrada. Te acercas a una palanca. Crees que abrirá el camino, pero en su lugar te encierra y te separa de Farkas. Miembros de la Mano de Plata lo rodean y entonces lo ves: un hombre lobo real.",
    "Tras el descubrimiento sobre Farkas y los compañeros, te adentras más en la tumba hasta que obtienes el fragmento de la legendaria Wuuthrad."
  ],
  'Tumba': [
    "Al regresar descubres que la Mano de Plata ha asesinado a Kodlak, lo que desata un ataque vengativo. \nTras aniquilar a la facción y recuperar el último fragmento de la Wuuthrad, te diriges al lugar de descanso de Ysgramor para cumplir la voluntad final de tu líder y curar su espíritu de la maldición.",
    "En las profundidades del salón funerario, invocas al espíritu de Kodlak para cumplir su última voluntad. \nAl quemar la cabeza de una Bruja de Glenmoril en el pedestal, se manifiesta el espíritu de la bestia; derrótalo para curar la maldición y permitir que tu líder descanse al fin en Sovngarde."
  ],
  'Carrera Blanca': [
    "Mientras caminabas a las afueras de Carrera Blanca escuchaste unos ruidos de lucha provenientes de una granja. \n\nCuando te acercaste viste a un grupo de guerreros derribando a un gigante, ¡ayúdalos!",
    "El grupo de guerreros te elogia y te invita a formar parte de Los Compañeros. \n\nDirígete a Jorrvaskr para hablar con Kodlak Melena Blanca, pero ten cuidado, se rumorea que de allí provienen aullidos extraños en las noches con luna."
  ],
  'Aquelarre': [
    "Tras unirte al Círculo y contraer la licantropía, Kodlak Melena Blanca acude a ti en busca de ayuda. \nTe cuenta que ha descubierto cómo curar la licantropía. \nTodo se reduce al origen de la maldición. \nDebes encontrar a las Brujas de Glenmoril y tomar sus cabezas.",
    "Lograste sobrevivir a la magia oscura de las brujas. \n\nUsaste tu propia maldición en su contra y las devoraste hasta que solo quedaron sus cabezas. \n\nEs momento de que vuelvas a Jorrvaskr."
  ]
}

ecs.registerComponent({
  name: 'rumorBookManager',
  schema: {
    leftText: ecs.eid,
    rightText: ecs.eid,
    leftButton: ecs.eid,
    rightButton: ecs.eid,
    nextSpreadBtn: ecs.eid,
    prevSpreadBtn: ecs.eid,
    closeBtn: ecs.eid,
    typingAudio: ecs.string,
    audioVolume: ecs.f32,
    charIntervalMs: ecs.f32,

    uiNuevaUbicacion: ecs.eid,
    imageElement: ecs.eid,
    nameElement: ecs.eid,
    titleElement: ecs.eid,

    markerCarreraBlanca: ecs.eid,
    markerTumulo: ecs.eid,
    markerAquelarre: ecs.eid,
    markerFalkreath: ecs.eid,
  },
  schemaDefaults: {
    typingAudio: 'assets/Sonido/Efectos de Sonido/Writing.mp3',
    audioVolume: 0.8,
    charIntervalMs: 40,
  },
  data: {
    rumorId: ecs.string,
    sourceCityPanel: ecs.eid,
    currentSpread: ecs.i32,

    leftFullText: ecs.string,
    leftVisibleChars: ecs.ui32,
    leftIsTyping: ecs.boolean,
    leftIsFinished: ecs.boolean,

    rightFullText: ecs.string,
    rightVisibleChars: ecs.ui32,
    rightIsTyping: ecs.boolean,
    rightIsFinished: ecs.boolean,

    msSinceLastChar: ecs.f32,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {

    const schema = schemaAttribute.get(eid)

    const RUMOR_UNLOCKS: Record<string, any> = {
      'Carrera Blanca': { location: 'Túmulo del Hombre de Polvo', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerEid: schema.markerCarreraBlanca },
      'Túmulo': { location: 'Aquelarre de Glenmoril', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerEid: schema.markerTumulo },
      'Aquelarre': { location: 'Tumba de Ysgramor', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerEid: schema.markerAquelarre },
      'Tumba': { location: 'Senda de Los Compañeros', image: 'assets/Iconos/UI/Wolf.png', markerEid: 0n },
      'Gruta': { location: 'Senda de La Licantropía Daedrica', image: 'assets/Iconos/UI/Wolf.png', markerEid: 0n },
      'Falkreath': { location: 'Gruta del Hombre Hinchado', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerEid: schema.markerFalkreath }
    }

    // ⚠️ TEMPORAL PARA TEST: startFadeIn ya no anima, solo pone opacidad en 1 directo.
    const startFadeIn = (targetEid: any) => {
      if (!targetEid) return
      ecs.Ui.set(world, targetEid, { opacity: 1 })
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

    const getTextId = (text: string) => text.slice(0, 30).trim()
    const isTextRead = (text: string) => {
      if (!text) return true;
      return dataManager.isTextCompleted(getTextId(text))
    }
    const markTextRead = (text: string) => {
      if (!text) return;
      dataManager.markTextCompleted(getTextId(text))
    }

    const fadeElement = (targetEid: any, fadeIn: boolean) => {
      if (!targetEid) return
      if (fadeIn) {
        ecs.Disabled.remove(world, targetEid)
      } else {
        ecs.Disabled.set(world, targetEid)
      }
    }

    const updateNavigationButtons = () => {
      const data = dataAttribute.get(eid)
      const schema = schemaAttribute.get(eid)

      const textsArray = RUMOR_TEXTS[data.rumorId] || []

      const hasPrev = data.currentSpread > 0
      const hasNext = (data.currentSpread * 2 + 2) < textsArray.length

      const leftPageIndex = data.currentSpread * 2
      const rightPageIndex = leftPageIndex + 1
      const leftRead = isTextRead(textsArray[leftPageIndex])
      const rightRead = !textsArray[rightPageIndex] || isTextRead(textsArray[rightPageIndex])

      fadeElement(schema.prevSpreadBtn, hasPrev)
      fadeElement(schema.nextSpreadBtn, hasNext && leftRead && rightRead)
    }

    const startTypingLeft = (fullText: string) => {
      const data = dataAttribute.cursor(eid)
      const shouldType = fullText.length > 0
      data.leftFullText = fullText
      data.leftVisibleChars = 0
      data.msSinceLastChar = 0
      data.leftIsTyping = shouldType
      data.leftIsFinished = !shouldType

      ecs.Disabled.remove(world, schema.leftText)
      ecs.Ui.set(world, schema.leftText, { text: '' })
      fadeElement(schema.leftButton, false)
      if (shouldType) {
        startAudio()
      }
    }

    const startTypingRight = (fullText: string) => {
      const data = dataAttribute.cursor(eid)
      const shouldType = fullText.length > 0
      data.rightFullText = fullText
      data.rightVisibleChars = 0
      data.msSinceLastChar = 0
      data.rightIsTyping = shouldType
      data.rightIsFinished = !shouldType

      ecs.Disabled.remove(world, schema.rightText)
      ecs.Ui.set(world, schema.rightText, { text: '' })
      fadeElement(schema.rightButton, false)
      if (shouldType) {
        startAudio()
      }
    }

    const renderSpread = () => {
      const data = dataAttribute.cursor(eid)
      const schema = schemaAttribute.get(eid)
      const textsArray = RUMOR_TEXTS[data.rumorId] || []

      const leftPageIndex = data.currentSpread * 2
      const rightPageIndex = leftPageIndex + 1

      const leftTextStr = textsArray[leftPageIndex] || ""
      const rightTextStr = textsArray[rightPageIndex] || ""

      const leftRead = isTextRead(leftTextStr)
      const rightRead = isTextRead(rightTextStr)

      data.leftFullText = leftTextStr
      data.rightFullText = rightTextStr
      data.msSinceLastChar = 0

      if (leftTextStr) {
        if (leftRead) {
          data.leftVisibleChars = leftTextStr.length
          data.leftIsTyping = false
          data.leftIsFinished = true
          ecs.Disabled.remove(world, schema.leftText)
          ecs.Ui.set(world, schema.leftText, { text: leftTextStr })
          fadeElement(schema.leftButton, false)
        } else {
          startTypingLeft(leftTextStr)
        }
      } else {
        data.leftFullText = ''
        data.leftVisibleChars = 0
        data.leftIsTyping = false
        data.leftIsFinished = true
        fadeElement(schema.leftText, false)
        fadeElement(schema.leftButton, false)
      }

      if (rightTextStr) {
        if (rightRead) {
          data.rightFullText = rightTextStr
          data.rightVisibleChars = rightTextStr.length
          data.rightIsTyping = false
          data.rightIsFinished = true
          ecs.Disabled.remove(world, schema.rightText)
          ecs.Ui.set(world, schema.rightText, { text: rightTextStr })
          fadeElement(schema.rightButton, false)
        } else if (leftRead) {
          startTypingRight(rightTextStr)
        } else {
          data.rightFullText = rightTextStr
          data.rightVisibleChars = 0
          data.msSinceLastChar = 0
          data.rightIsTyping = false
          data.rightIsFinished = false
          ecs.Disabled.remove(world, schema.rightText)
          ecs.Ui.set(world, schema.rightText, { text: '' })
          fadeElement(schema.rightButton, false)
        }
      } else {
        data.rightFullText = ''
        data.rightVisibleChars = 0
        data.rightIsTyping = false
        data.rightIsFinished = true
        fadeElement(schema.rightText, false)
        fadeElement(schema.rightButton, false)
      }

      updateNavigationButtons()
    }

    const handleSkip = () => {
       const data = dataAttribute.cursor(eid)
       const schema = schemaAttribute.get(eid)

       if (data.leftIsTyping) {
          data.leftIsTyping = false
          data.leftVisibleChars = data.leftFullText.length
          data.leftIsFinished = true
          ecs.Ui.set(world, schema.leftText, { text: data.leftFullText })
          stopAudio()
          ecs.Disabled.remove(world, schema.leftButton)
          startFadeIn(schema.leftButton) // ya no anima, solo opacidad = 1 (temporal)
       } else if (data.rightIsTyping) {
          data.rightIsTyping = false
          data.rightVisibleChars = data.rightFullText.length
          data.rightIsFinished = true
          ecs.Ui.set(world, schema.rightText, { text: data.rightFullText })
          stopAudio()
          ecs.Disabled.remove(world, schema.rightButton)
          startFadeIn(schema.rightButton) // ya no anima, solo opacidad = 1 (temporal)
       }
    }

    const state = ecs.defineState('default').initial()

    const startFade = (uiEntity: any, startOp: number, endOp: number, duration: number, onComplete?: () => void) => {
      if (!uiEntity) {
        if (onComplete) onComplete()
        return
      }
      if (duration <= 0) duration = 1

      let start: number | null = null
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)

        const currentOp = startOp + (endOp - startOp) * progress
        try { ecs.Ui.set(world, uiEntity, { opacity: currentOp }) } catch(e){}

        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          if (onComplete) onComplete()
        }
      }
      requestAnimationFrame(step)
    }

    const triggerUnlock = (rumorId: string) => {
        const unlockData = RUMOR_UNLOCKS[rumorId]
        if (!unlockData) return

        const schema = schemaAttribute.get(eid)
        const { uiNuevaUbicacion, imageElement, nameElement, titleElement } = schema

        requestAnimationFrame(() => {
            ecs.Disabled.set(world, eid)

            if (nameElement && unlockData.location) {
              try { ecs.Ui.set(world, nameElement, { text: unlockData.location }) } catch(e){}
            }
            if (titleElement) {
              try { ecs.Ui.set(world, titleElement, { text: "NUEVA UBICACIÓN" }) } catch(e){}
            }
            if (imageElement && unlockData.image) {
              try { ecs.Ui.set(world, imageElement, { image: unlockData.image }) } catch(e){}
            }

            if (unlockData.location) {
              dataManager.unlockLocation(unlockData.location)
            }

            if (unlockData.markerEid) {
               ecs.Disabled.remove(world, unlockData.markerEid)
            }

            if (uiNuevaUbicacion) {
              try { ecs.Ui.set(world, uiNuevaUbicacion, { opacity: 0 }) } catch(e){}
              ecs.Disabled.remove(world, uiNuevaUbicacion)

              const fDur = 1000
              const hDur = 2000

              startFade(uiNuevaUbicacion, 0, 1, fDur, () => {
                world.time.setTimeout(() => {
                  startFade(uiNuevaUbicacion, 1, 0, fDur, () => {
                    ecs.Disabled.set(world, uiNuevaUbicacion)
                  })
                }, hDur)
              })
            }
        })
    }

    const attachRecursiveClickListener = (targetEid: any, handler: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, (e) => {
          world.time.setTimeout(() => handler(e), 10)
      })
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child, handler)
        }
      } catch (e) {}
    }

    state.onEnter(() => {
        dataAttribute.set(eid, {
          rumorId: '',
          sourceCityPanel: 0n,
          currentSpread: 0,
          leftFullText: '', leftVisibleChars: 0, leftIsTyping: false, leftIsFinished: true,
          rightFullText: '', rightVisibleChars: 0, rightIsTyping: false, rightIsFinished: true,
          msSinceLastChar: 0,
        })
        stopAudio()

        const schema = schemaAttribute.get(eid)

        attachRecursiveClickListener(schema.leftButton, () => {
           const data = dataAttribute.cursor(eid)
           const textsArray = RUMOR_TEXTS[data.rumorId] || []
           markTextRead(data.leftFullText)
           fadeElement(schema.leftButton, false)

           if (data.rightFullText && !isTextRead(data.rightFullText)) {
              startTypingRight(data.rightFullText)
           } else if (!data.rightFullText) {
              triggerUnlock(data.rumorId)
           } else {
              updateNavigationButtons()
           }
        })

        attachRecursiveClickListener(schema.rightButton, () => {
           const data = dataAttribute.cursor(eid)
           const textsArray = RUMOR_TEXTS[data.rumorId] || []

           markTextRead(data.rightFullText)
           fadeElement(schema.rightButton, false)

           if ((data.currentSpread * 2 + 2) < textsArray.length) {
              data.currentSpread += 1
              renderSpread()
           } else {
              triggerUnlock(data.rumorId)
           }
        })

        attachRecursiveClickListener(schema.nextSpreadBtn, () => {
           const data = dataAttribute.cursor(eid)
           const textsArray = RUMOR_TEXTS[data.rumorId] || []
           if ((data.currentSpread * 2 + 2) < textsArray.length) {
              data.currentSpread += 1
              renderSpread()
           }
        })

        attachRecursiveClickListener(schema.prevSpreadBtn, () => {
           const data = dataAttribute.cursor(eid)
           if (data.currentSpread > 0) {
              data.currentSpread -= 1
              renderSpread()
           }
        })

        attachRecursiveClickListener(schema.closeBtn, () => {
           const data = dataAttribute.cursor(eid)
           stopAudio()
           data.leftIsTyping = false
           data.rightIsTyping = false
           requestAnimationFrame(() => {
               ecs.Disabled.set(world, eid)
               if (data.sourceCityPanel) {
                   ecs.Disabled.remove(world, data.sourceCityPanel)
               }
           })
        })

        state.listen(eid, ecs.input.UI_CLICK, (e) => {
            const data = dataAttribute.cursor(eid)
            if (data.leftIsTyping || data.rightIsTyping) {
                world.time.setTimeout(() => handleSkip(), 10)
            }
        })
    })

    state.listen(eid, OPEN_RUMOR_EVENT, (e: any) => {
         const rumorId = e.data?.rumorId || e.rumorId || e.detail?.rumorId
         const sourceCityPanel = e.data?.sourceCityPanel || e.sourceCityPanel || e.detail?.sourceCityPanel
         const textsArray = RUMOR_TEXTS[rumorId]
         if (!textsArray) {
            console.warn(`[rumorBookManager] No se encontraron textos para el rumor: ${rumorId}`, e)
            return
         }

         const data = dataAttribute.cursor(eid)
         data.rumorId = rumorId
         data.sourceCityPanel = sourceCityPanel || 0n
         data.currentSpread = 0

         ecs.Disabled.remove(world, eid)
         renderSpread()
    })

    state.onTick(() => {
         const data = dataAttribute.cursor(eid)
         const schema = schemaAttribute.get(eid)

         if (!data.leftIsTyping && !data.rightIsTyping) return;

         const charIntervalMs = schema.charIntervalMs ?? 40

         if (data.leftIsTyping) {
            if (data.leftVisibleChars >= data.leftFullText.length) return

            let newMs = data.msSinceLastChar + world.time.delta
            let newVisible = data.leftVisibleChars

            while (newMs >= charIntervalMs && newVisible < data.leftFullText.length) {
               newMs -= charIntervalMs
               newVisible += 1
            }

            ecs.Ui.set(world, schema.leftText, { text: data.leftFullText.slice(0, newVisible) })
            data.msSinceLastChar = newMs
            data.leftVisibleChars = newVisible

            if (newVisible >= data.leftFullText.length) {
               data.leftIsTyping = false
               data.leftIsFinished = true
               stopAudio()
               ecs.Disabled.remove(world, schema.leftButton)
               startFadeIn(schema.leftButton) // ya no anima, solo opacidad = 1 (temporal)
            }
         }
         else if (data.rightIsTyping) {
            if (data.rightVisibleChars >= data.rightFullText.length) return

            let newMs = data.msSinceLastChar + world.time.delta
            let newVisible = data.rightVisibleChars

            while (newMs >= charIntervalMs && newVisible < data.rightFullText.length) {
               newMs -= charIntervalMs
               newVisible += 1
            }

            ecs.Ui.set(world, schema.rightText, { text: data.rightFullText.slice(0, newVisible) })
            data.msSinceLastChar = newMs
            data.rightVisibleChars = newVisible

            if (newVisible >= data.rightFullText.length) {
               data.rightIsTyping = false
               data.rightIsFinished = true
               stopAudio()
               ecs.Disabled.remove(world, schema.rightButton)
               startFadeIn(schema.rightButton) // ya no anima, solo opacidad = 1 (temporal)
            }
         }
    })

    state.onExit(() => {
         stopAudio()
    })
  },
})