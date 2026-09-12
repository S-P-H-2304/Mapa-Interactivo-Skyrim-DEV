import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'linkButton',
  schema: {
    // @label Enlace (URL)
    url: ecs.string,
  },
  schemaDefaults: {
    url: 'https://elderscrolls.fandom.com/es/wiki/Skyrim',
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const abrirEnlace = () => {
      const {url} = schemaAttribute.get(eid)
      if (!url) return

      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const state = ecs.defineState('default').initial()

    // Detección recursiva de clics en el botón y todos sus posibles hijos en la UI
    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, abrirEnlace)
      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    attachRecursiveClickListener(eid)
  },
})