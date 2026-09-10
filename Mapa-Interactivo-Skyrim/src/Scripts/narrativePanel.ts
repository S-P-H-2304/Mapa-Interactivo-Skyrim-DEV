import * as ecs from '@8thwall/ecs'
import {UNLOCK_TRIGGERED, UnlockPayload} from './unlockEvents'

ecs.registerComponent({
  name: 'narrativePanel',
  schema: {
    textUi: ecs.eid,
    nextButton: ecs.eid,
    prevButton: ecs.eid,
    page1: ecs.string,
    page2: ecs.string,
    page3: ecs.string,
    page4: ecs.string,
    page2UnlockId: ecs.string,
    page3UnlockId: ecs.string,
    page4UnlockId: ecs.string,
  },
  data: {
    unlockedPages: ecs.ui8,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const {textUi, nextButton, prevButton} = schemaAttribute.get(eid)
    let currentPage = 0

    const getPages = () => {
      const s = schemaAttribute.get(eid)
      return [s.page1, s.page2, s.page3, s.page4]
    }

    const renderPage = () => {
      ecs.Ui.set(world, textUi, {text: getPages()[currentPage]})
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, {unlockedPages: 1})
        renderPage()
      })
      .listen(nextButton, ecs.input.UI_CLICK, () => {
        const {unlockedPages} = dataAttribute.get(eid)
        if (currentPage < unlockedPages - 1) {
          currentPage += 1
          renderPage()
        }
      })
      .listen(prevButton, ecs.input.UI_CLICK, () => {
        if (currentPage > 0) {
          currentPage -= 1
          renderPage()
        }
      })
      .listen(world.events.globalId, UNLOCK_TRIGGERED, (event) => {
        const {unlockId} = event.data as UnlockPayload
        const {page2UnlockId, page3UnlockId, page4UnlockId} = schemaAttribute.get(eid)
        const {unlockedPages} = dataAttribute.get(eid)

        let newUnlockedPages = unlockedPages
        if (unlockId === page2UnlockId) newUnlockedPages = Math.max(newUnlockedPages, 2)
        if (unlockId === page3UnlockId) newUnlockedPages = Math.max(newUnlockedPages, 3)
        if (unlockId === page4UnlockId) newUnlockedPages = Math.max(newUnlockedPages, 4)

        if (newUnlockedPages > unlockedPages) {
          dataAttribute.set(eid, {unlockedPages: newUnlockedPages})
          currentPage = newUnlockedPages - 1
          renderPage()
        }
      })
  },
})