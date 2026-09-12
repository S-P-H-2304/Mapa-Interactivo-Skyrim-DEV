import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'typewriterText',
  schema: {
    charIntervalMs: ecs.f32,
    // @label Activar al terminar
    enableTarget: ecs.eid,
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

        const {charIntervalMs, enableTarget} = schemaAttribute.get(eid)
        let newMs = msSinceLastChar + world.time.delta
        let newVisible = visibleChars

        while (newMs >= charIntervalMs && newVisible < fullText.length) {
            newMs -= charIntervalMs
            newVisible += 1
        }

        ecs.Ui.set(world, eid, {text: fullText.slice(0, newVisible)}) 
        dataAttribute.set(eid, {msSinceLastChar: newMs, visibleChars: newVisible})

        // Cuando recién terminamos de escribir todo el texto:
        if (newVisible >= fullText.length && enableTarget) {
          // Quitamos el disabled del botón/objetivo
          ecs.Disabled.remove(world, enableTarget)
          // Nos aseguramos de iniciar su opacidad en 0 para hacerle un pequeño fade in
          ecs.Ui.set(world, enableTarget, { opacity: 0 })
          startFadeIn(enableTarget)
        }
      })
  },
})
