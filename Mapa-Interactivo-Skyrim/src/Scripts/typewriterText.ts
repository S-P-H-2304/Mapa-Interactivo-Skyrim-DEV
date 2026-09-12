import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'typewriterText',
  schema: {
    charIntervalMs: ecs.f32,
  },
  schemaDefaults: {
    charIntervalMs: 40,
  },
  data: {
    fullText: ecs.string,
    visibleChars: ecs.ui32,
    msSinceLastChar: ecs.f32,
    hasPlayedOnce: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        const fullText = ecs.Ui.get(world, eid).text
        dataAttribute.set(eid, {fullText, visibleChars: 0, msSinceLastChar: 0, hasPlayedOnce: false})
      })
      .listen(eid, 'start-typing', () => {
        const {hasPlayedOnce} = dataAttribute.get(eid)
        if (hasPlayedOnce) return
        dataAttribute.set(eid, {visibleChars: 0, msSinceLastChar: 0, hasPlayedOnce: true})
        ecs.Ui.set(world, eid, {text: ''})
      })
      .onTick(() => {
        const {fullText, visibleChars, msSinceLastChar} = dataAttribute.get(eid)
        if (visibleChars >= fullText.length) return

        const {charIntervalMs} = schemaAttribute.get(eid)
        let newMs = msSinceLastChar + world.time.delta
        let newVisible = visibleChars

        while (newMs >= charIntervalMs && newVisible < fullText.length) {
            newMs -= charIntervalMs
            newVisible += 1
        }

        ecs.Ui.set(world, eid, {text: fullText.slice(0, newVisible)}) // ahora se llama SIEMPRE, no solo si cambió
        dataAttribute.set(eid, {msSinceLastChar: newMs, visibleChars: newVisible})
        })
  },
})