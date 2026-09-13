import * as ecs from '@8thwall/ecs'
import { dataManager } from './dataManager'

ecs.registerComponent({
  name: 'rumorBookManager',
  schema: {
    // Vistas (Hojas)
    hoja1: ecs.eid,
    hoja2: ecs.eid,

    // Botones de Navegación entre Hojas
    btnSigPag: ecs.eid,
    btnAntPag: ecs.eid,

    // Páginas y Botones de Continuar
    page1Text: ecs.eid,
    page1Btn: ecs.eid,

    page2Text: ecs.eid,
    page2Btn: ecs.eid,

    page3Text: ecs.eid,
    page3Btn: ecs.eid,

    page4Text: ecs.eid,
    page4Btn: ecs.eid,

    // Audio
    // @asset
    pageTurnAudio: ecs.string,
    audioVolume: ecs.f32,
  },
  schemaDefaults: {
    pageTurnAudio: '',
    audioVolume: 0.8,
  },
  data: {
    currentVista: ecs.ui8,
  },
  stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
    const fullTextMap = new Map<any, string>()

    const cacheText = (textEid: any) => {
      if (!textEid) return
      if (fullTextMap.has(textEid)) return
      if (ecs.Ui.has(world, textEid)) {
        const text = ecs.Ui.get(world, textEid).text || ''
        if (text) {
          fullTextMap.set(textEid, text)
        }
      }
    }

    const cacheAllTexts = () => {
      const s = schemaAttribute.get(eid)
      cacheText(s.page1Text)
      cacheText(s.page2Text)
      cacheText(s.page3Text)
      cacheText(s.page4Text)
    }

    const getFullText = (textEid: any): string => {
      if (!textEid) return ''
      if (!fullTextMap.has(textEid)) {
        cacheText(textEid)
      }
      return fullTextMap.get(textEid) || (ecs.Ui.has(world, textEid) ? ecs.Ui.get(world, textEid).text || '' : '')
    }

    const isCompleted = (textEid: any): boolean => {
      if (!textEid) return false
      const full = getFullText(textEid)
      const textId = full.slice(0, 30).trim()
      return textId ? dataManager.isTextCompleted(textId) : false
    }

    const playPageTurn = () => {
      const { pageTurnAudio, audioVolume } = schemaAttribute.get(eid)
      if (!pageTurnAudio) return
      const url = pageTurnAudio
      const volume = audioVolume !== undefined && audioVolume !== null ? audioVolume : 0.8

      if (ecs.Audio.has(world, eid)) {
        ecs.Audio.mutate(world, eid, (cursor) => {
          cursor.url = url
          cursor.volume = volume
          cursor.loop = false
          cursor.paused = false
        })
      } else {
        ecs.Audio.set(world, eid, {
          url,
          volume,
          loop: false,
          paused: false,
          positional: false,
        })
      }
    }

    const syncBookState = (targetVista: number = 1) => {
      cacheAllTexts()
      dataAttribute.set(eid, { currentVista: targetVista })

      const {
        hoja1, hoja2, btnSigPag, btnAntPag,
        page1Text, page1Btn,
        page2Text, page2Btn,
        page3Text, page3Btn,
        page4Text, page4Btn,
      } = schemaAttribute.get(eid)

      if (targetVista === 1) {
        if (hoja1) ecs.Disabled.remove(world, hoja1)
        if (hoja2) ecs.Disabled.set(world, hoja2)
        if (btnAntPag) ecs.Disabled.set(world, btnAntPag)

        const p1Done = isCompleted(page1Text)
        if (p1Done) {
          if (page1Text) {
            ecs.Disabled.remove(world, page1Text)
            if (ecs.Ui.has(world, page1Text)) {
              ecs.Ui.set(world, page1Text, { text: getFullText(page1Text) })
            }
          }
          if (page1Btn) ecs.Disabled.set(world, page1Btn)

          const p2Done = isCompleted(page2Text)
          if (p2Done) {
            if (page2Text) {
              ecs.Disabled.remove(world, page2Text)
              if (ecs.Ui.has(world, page2Text)) {
                ecs.Ui.set(world, page2Text, { text: getFullText(page2Text) })
              }
            }
            if (page2Btn) ecs.Disabled.set(world, page2Btn)

            if (hoja2 && btnSigPag) {
              ecs.Disabled.remove(world, btnSigPag)
            } else if (btnSigPag) {
              ecs.Disabled.set(world, btnSigPag)
            }
          } else {
            if (page2Text) {
              ecs.Disabled.remove(world, page2Text)
              world.events.dispatch(page2Text, 'start-typing', {})
            }
            if (page2Btn) ecs.Disabled.set(world, page2Btn)
            if (btnSigPag) ecs.Disabled.set(world, btnSigPag)
          }
        } else {
          if (page1Text) {
            ecs.Disabled.remove(world, page1Text)
            world.events.dispatch(page1Text, 'start-typing', {})
          }
          if (page1Btn) ecs.Disabled.set(world, page1Btn)
          if (page2Text) ecs.Disabled.set(world, page2Text)
          if (page2Btn) ecs.Disabled.set(world, page2Btn)
          if (btnSigPag) ecs.Disabled.set(world, btnSigPag)
        }

        // Seguridad extra contra el timeout de 50ms de typewriterText simulando clic
        world.time.setTimeout(() => {
          const cur = dataAttribute.get(eid)
          if (cur && cur.currentVista === 1) {
            if (hoja1) ecs.Disabled.remove(world, hoja1)
            if (hoja2) ecs.Disabled.set(world, hoja2)
            if (btnAntPag) ecs.Disabled.set(world, btnAntPag)
            if (btnSigPag && hoja2 && isCompleted(page2Text)) {
              ecs.Disabled.remove(world, btnSigPag)
            }
            if (page2Btn && isCompleted(page2Text)) {
              ecs.Disabled.set(world, page2Btn)
            }
          }
        }, 80)
        if (page3Btn) ecs.Disabled.set(world, page3Btn)
        if (page4Btn) ecs.Disabled.set(world, page4Btn)
      } else if (targetVista === 2) {
        if (hoja1) ecs.Disabled.set(world, hoja1)
        if (hoja2) ecs.Disabled.remove(world, hoja2)
        if (btnSigPag) ecs.Disabled.set(world, btnSigPag)
        if (btnAntPag) ecs.Disabled.remove(world, btnAntPag)
        if (page1Btn) ecs.Disabled.set(world, page1Btn)
        if (page2Btn) ecs.Disabled.set(world, page2Btn)

        const p3Done = isCompleted(page3Text)
        if (p3Done) {
          if (page3Text) {
            ecs.Disabled.remove(world, page3Text)
            if (ecs.Ui.has(world, page3Text)) {
              ecs.Ui.set(world, page3Text, { text: getFullText(page3Text) })
            }
          }
          if (page3Btn) ecs.Disabled.set(world, page3Btn)

          if (page4Text) {
            const p4Done = isCompleted(page4Text)
            if (p4Done) {
              ecs.Disabled.remove(world, page4Text)
              if (ecs.Ui.has(world, page4Text)) {
                ecs.Ui.set(world, page4Text, { text: getFullText(page4Text) })
              }
              if (page4Btn) ecs.Disabled.set(world, page4Btn)
            } else {
              ecs.Disabled.remove(world, page4Text)
              world.events.dispatch(page4Text, 'start-typing', {})
              if (page4Btn) ecs.Disabled.set(world, page4Btn)
            }
          }
        } else {
          if (page3Text) {
            ecs.Disabled.remove(world, page3Text)
            world.events.dispatch(page3Text, 'start-typing', {})
          }
          if (page3Btn) ecs.Disabled.set(world, page3Btn)
          if (page4Text) ecs.Disabled.set(world, page4Text)
          if (page4Btn) ecs.Disabled.set(world, page4Btn)
        }
      }
    }

    const state = ecs.defineState('default')
      .initial()
      .onEnter(() => {
        cacheAllTexts()
        dataAttribute.set(eid, { currentVista: 1 })
        syncBookState(1)
      })
      .listen(eid, 'start-typing', (event: any) => {
        // Solo responder si el evento fue dirigido explícitamente al panel del rumor al abrirse.
        // Ignorar eventos 'start-typing' que burbujean desde textos hijos (Página 3, etc.)
        if (event && event.target && event.target !== eid) {
          return
        }
        if (isTransitioning) {
          return
        }
        syncBookState(1)
      })

    let isTransitioning = false
    const flipToVista = (targetVista: number) => {
      if (isTransitioning) return
      isTransitioning = true
      playPageTurn()
      syncBookState(targetVista)
      world.time.setTimeout(() => {
        isTransitioning = false
      }, 250)
    }

    const attachRecursiveClickListener = (targetEid: any, onClick: () => void) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, onClick)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child, onClick)
        }
      } catch (e) {}
    }

    const {
      btnSigPag, btnAntPag,
      page1Btn, page2Btn, page3Btn,
    } = schemaAttribute.get(eid)

    if (btnSigPag) {
      attachRecursiveClickListener(btnSigPag, () => {
        flipToVista(2)
      })
    }

    if (btnAntPag) {
      attachRecursiveClickListener(btnAntPag, () => {
        flipToVista(1)
      })
    }

    if (page1Btn) {
      attachRecursiveClickListener(page1Btn, () => {
        world.time.setTimeout(() => {
          const { page2Text } = schemaAttribute.get(eid)
          if (page2Text) {
            ecs.Disabled.remove(world, page2Text)
            world.events.dispatch(page2Text, 'start-typing', {})
          }
        }, 50)
      })
    }

    if (page2Btn) {
      attachRecursiveClickListener(page2Btn, () => {
        const { hoja2 } = schemaAttribute.get(eid)
        if (hoja2) {
          world.time.setTimeout(() => {
            flipToVista(2)
          }, 50)
        }
      })
    }

    if (page3Btn) {
      attachRecursiveClickListener(page3Btn, () => {
        const { page4Text } = schemaAttribute.get(eid)
        if (page4Text) {
          world.time.setTimeout(() => {
            ecs.Disabled.remove(world, page4Text)
            world.events.dispatch(page4Text, 'start-typing', {})
          }, 50)
        }
      })
    }
  },
})
