import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

ecs.registerComponent({
  name: 'playerInteraction',
  schema: {
    uiPanel: ecs.eid,
    markerModel: ecs.eid,
    // @asset
    songUrl: ecs.string,
    activationDelay: ecs.f32,
  },
  schemaDefaults: {
    activationDelay: 1000, // 1 second
  },
  data: {
    timeoutId: ecs.i32,
    isActive: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    
    const triggerActivation = () => {
        const schema = schemaAttribute.cursor(eid)
        const data = dataAttribute.cursor(eid)
        
        data.isActive = true
        data.timeoutId = 0
        
        // 1. Mostrar UI Panel
        if (schema.uiPanel) {
            ecs.Disabled.remove(world, schema.uiPanel)
        }
        
        // 2. Animación del marcador a "Selected"
        if (schema.markerModel) {
            ecs.GltfModel.set(world, schema.markerModel, {
                animationClip: 'Selected',
            })
        }
        
        // 3. Audio Manager Fade In
        if (schema.songUrl) {
            const payload: LocationPayload = { songUrl: schema.songUrl }
            world.events.dispatch(world.events.globalId, LOCATION_ENTER, payload)
        }
    }
    
    const triggerDeactivation = () => {
        const schema = schemaAttribute.cursor(eid)
        const data = dataAttribute.cursor(eid)
        
        data.isActive = false
        
        // 1. Ocultar UI Panel
        if (schema.uiPanel) {
            ecs.Disabled.set(world, schema.uiPanel, {})
        }
        
        // 2. Animación inversa del marcador
        if (schema.markerModel) {
            ecs.GltfModel.set(world, schema.markerModel, {
                animationClip: 'Selected Inverse',
            })
        }
        
        // 3. Audio Manager Fade Out a Main
        world.events.dispatch(world.events.globalId, LOCATION_EXIT, {})
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
          dataAttribute.set(eid, { timeoutId: 0, isActive: false })
      })
      .listen(eid, ecs.physics.COLLISION_START_EVENT, () => {
          const data = dataAttribute.cursor(eid)
          const schema = schemaAttribute.cursor(eid)
          
          if (data.isActive) return
          
          if (data.timeoutId !== 0) {
              world.time.clearTimeout(data.timeoutId)
          }
          
          const newTimeoutId = world.time.setTimeout(() => {
              const d = dataAttribute.cursor(eid)
              if (d.timeoutId !== 0) {
                  triggerActivation()
              }
          }, schema.activationDelay)
          
          data.timeoutId = newTimeoutId
      })
      .listen(eid, ecs.physics.COLLISION_END_EVENT, () => {
          const data = dataAttribute.cursor(eid)
          
          if (data.timeoutId !== 0) {
              world.time.clearTimeout(data.timeoutId)
              data.timeoutId = 0
          }
          
          if (data.isActive) {
              triggerDeactivation()
          }
      })
      .onExit(() => {
          const data = dataAttribute.get(eid)
          if (data.timeoutId !== 0) {
              world.time.clearTimeout(data.timeoutId)
          }
      })
  }
})
