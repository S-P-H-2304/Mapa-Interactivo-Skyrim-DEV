import * as ecs from '@8thwall/ecs'
import { OPEN_RUMOR_EVENT } from './rumorBookManager'

ecs.registerComponent({
  name: 'openRumorBtn',
  schema: {
    rumorId: ecs.string,
    universalPanel: ecs.eid,
    // Panel de la ciudad (para ocultarlo al abrir el rumor, si se desea)
    cityPanelToHide: ecs.eid,
  },
  stateMachine: ({world, eid, schemaAttribute}) => {
    const state = ecs.defineState('default').initial()

    // Función auxiliar para aplicar el clic a los hijos también
    const attachRecursiveClickListener = (targetEid: any) => {
      if (!targetEid) return
      state.listen(targetEid, ecs.input.UI_CLICK, () => {
         const { rumorId, universalPanel, cityPanelToHide } = schemaAttribute.get(eid)
         
         requestAnimationFrame(() => {
             if (cityPanelToHide) {
                 ecs.Disabled.set(world, cityPanelToHide)
             }
             
             if (universalPanel) {
               ecs.Disabled.remove(world, universalPanel)
               world.time.setTimeout(() => {
                   world.events.dispatch(universalPanel, OPEN_RUMOR_EVENT, { rumorId, sourceCityPanel: cityPanelToHide })
               }, 50)
             }
         })
      })

      try {
        for (const child of world.getChildren(targetEid)) {
          attachRecursiveClickListener(child)
        }
      } catch (e) {}
    }

    state.onEnter(() => {
         attachRecursiveClickListener(eid)
    })
  }
})
