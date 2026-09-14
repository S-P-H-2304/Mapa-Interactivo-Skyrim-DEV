import * as ecs from '@8thwall/ecs'
import { LOCATION_ENTER, LOCATION_EXIT, LocationPayload } from './audioManager'

// Flag compartido entre todas las instancias de playerInteraction.
// true = hay un panel de ciudad o rumor visible → bloquea nuevas activaciones de cualquier collider.
let anyPanelOpen = false

// Registro compartido de marcadores que actualmente están colisionando con el jugador:
// Map<markerEid, { playerEid: any, enterTime: number }>
const activeCollisions = new Map<any, { playerEid: any, enterTime: number }>()

const getEntityWorldPos = (world: ecs.World, targetEid: any): { x: number, y: number, z: number } | null => {
  try {
    if (world.transform && typeof world.transform.getWorldPosition === 'function') {
      const p = world.transform.getWorldPosition(targetEid)
      if (p && typeof p.x === 'number') {
        return { x: p.x, y: p.y, z: p.z }
      }
    }
  } catch (e) {}

  try {
    if (world.three && world.three.entityToObject) {
      const obj = world.three.entityToObject.get(targetEid)
      if (obj && typeof obj.getWorldPosition === 'function') {
        const wp = obj.position.clone()
        obj.getWorldPosition(wp)
        return { x: wp.x, y: wp.y, z: wp.z }
      }
    }
  } catch (e) {}

  try {
    if (ecs.Position && ecs.Position.has(world, targetEid)) {
      const p = ecs.Position.get(world, targetEid)
      if (p && typeof p.x === 'number') {
        return { x: p.x, y: p.y, z: p.z }
      }
    }
  } catch (e) {}

  return null
}

const getDistanceBetween = (world: ecs.World, eidA: any, eidB: any): number => {
  if (!eidA || !eidB) return Infinity
  const posA = getEntityWorldPos(world, eidA)
  const posB = getEntityWorldPos(world, eidB)
  if (!posA || !posB) return Infinity
  const dx = posA.x - posB.x
  const dy = posA.y - posB.y
  const dz = posA.z - posB.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

const isClosestMarkerToPlayer = (world: ecs.World, markerEid: any, playerEid: any): boolean => {
  if (activeCollisions.size <= 1) return true

  const myDist = getDistanceBetween(world, markerEid, playerEid)
  if (!isFinite(myDist)) return true

  for (const [otherEid, info] of activeCollisions.entries()) {
    if (otherEid !== markerEid && !ecs.Disabled.has(world, otherEid)) {
      const otherDist = getDistanceBetween(world, otherEid, info.playerEid)
      if (isFinite(otherDist) && otherDist < myDist) {
        return false
      }
    }
  }

  return true
}

ecs.registerComponent({
  name: 'playerInteraction',
  schema: {
    playerTarget: ecs.eid, // Referencia al Jugador (Image Target)
    uiPanel: ecs.eid,
    rumorPanel: ecs.eid,
    markerModel: ecs.eid,
    backgroundFrame: ecs.eid,
    // @asset
    songUrl: ecs.string,
    activationDelay: ecs.f32,
    dimOpacity: ecs.f32,
  },
  schemaDefaults: {
    activationDelay: 1000, // 1 segundo de retraso
    dimOpacity: 0.75,      // Opacidad del fondo negro al abrir el panel
  },
  data: {
    timeoutId: ecs.i32,
    isActive: ecs.boolean,
  },
  stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
    const isLocationOpen = () => {
      const schema = schemaAttribute.get(eid)
      const uiOpen = schema.uiPanel ? !ecs.Disabled.has(world, schema.uiPanel) : false
      const rumorOpen = schema.rumorPanel ? !ecs.Disabled.has(world, schema.rumorPanel) : false
      return uiOpen || rumorOpen
    }

    const triggerActivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = true
      data.timeoutId = 0
      anyPanelOpen = true
      activeCollisions.clear()

      // 1. Mostrar Panel de UI de la ciudad
      if (schema.uiPanel) {
        ecs.Disabled.remove(world, schema.uiPanel)
      }

      // 2. Oscurecer el fondo de UI General
      if (schema.backgroundFrame) {
        const targetDim = schema.dimOpacity ?? 0.75
        ecs.Ui.set(world, schema.backgroundFrame, { backgroundOpacity: targetDim })
      }

      // 3. Animación del marcador a "Selected"
      const modelEid = schema.markerModel || eid
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Crossfade a música del sitio
      const payload: LocationPayload = {
        speakerEid: eid,
        songUrl: schema.songUrl || undefined,
      }
      world.events.dispatch(world.events.globalId, LOCATION_ENTER, payload)
    }

    const triggerDeactivation = () => {
      const schema = schemaAttribute.cursor(eid)
      const data = dataAttribute.cursor(eid)

      data.isActive = false
      anyPanelOpen = false
      activeCollisions.delete(eid)

      // 1. Ocultar Panel de UI de la ciudad y panel de rumor si sigue visible
      if (schema.uiPanel) {
        ecs.Disabled.set(world, schema.uiPanel, {})
      }
      if (schema.rumorPanel && !ecs.Disabled.has(world, schema.rumorPanel)) {
        ecs.Disabled.set(world, schema.rumorPanel, {})
      }

      // 2. Restaurar transparencia del fondo de UI General
      if (schema.backgroundFrame) {
        ecs.Ui.set(world, schema.backgroundFrame, { backgroundOpacity: 0 })
      }

      // 3. Animación inversa del marcador
      const modelEid = schema.markerModel || eid
      if (modelEid) {
        ecs.GltfModel.set(world, modelEid, {
          animationClip: 'Selected Inverse',
          loop: false,
          paused: false,
        })
      }

      // 4. Audio Manager: Retornar a música principal
      const payload: LocationPayload = {
        speakerEid: eid,
      }
      world.events.dispatch(world.events.globalId, LOCATION_EXIT, payload)
    }

    ecs.defineState('default')
      .initial()
      .onEnter(() => {
        dataAttribute.set(eid, { timeoutId: 0, isActive: false })
      })
      .onTick(() => {
        const data = dataAttribute.cursor(eid)

        // Si este marcador está activo pero ya no está abierta ni la UI de ubicación ni el rumor
        // (ej. el usuario presionó "Salir" o completó el rumor),
        // desactivar para liberar el bloqueo y retornar la música.
        if (data.isActive && !isLocationOpen()) {
          triggerDeactivation()
          return
        }

        // Si el marcador está en colisión pero su timeout terminó cediendo a otro más cercano,
        // comprobar periódicamente si ahora este marcador pasó a ser el más cercano
        if (!anyPanelOpen && !data.isActive && activeCollisions.has(eid) && data.timeoutId === 0) {
          const colInfo = activeCollisions.get(eid)
          const playerEid = colInfo ? colInfo.playerEid : null
          if (playerEid && isClosestMarkerToPlayer(world, eid, playerEid)) {
            const schema = schemaAttribute.get(eid)
            const delay = schema.activationDelay ?? 0
            data.timeoutId = world.time.setTimeout(() => {
              const d = dataAttribute.cursor(eid)
              d.timeoutId = 0
              if (anyPanelOpen || d.isActive) return
              if (!activeCollisions.has(eid)) return
              if (isClosestMarkerToPlayer(world, eid, playerEid)) {
                triggerActivation()
              }
            }, delay)
          }
        }
      })
      .listen(world.events.globalId, 'force-location-deactivate', () => {
        const data = dataAttribute.cursor(eid)
        if (data.isActive) {
          triggerDeactivation()
        }
      })
      .listen(eid, ecs.physics.COLLISION_START_EVENT, (event: any) => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Verificar que el objeto que colisiona es el jugador
        if (schema.playerTarget && event.data.other !== schema.playerTarget) return

        // SEGURO GLOBAL: Si hay algún panel abierto (ubicación o rumor), BLOQUEAR completamente nuevos triggers
        if (anyPanelOpen) return

        if (data.isActive) return

        const playerEid = event.data.other || schema.playerTarget
        activeCollisions.set(eid, { playerEid, enterTime: Date.now() })

        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        const delay = schema.activationDelay ?? 0

        const startActivationTimer = () => {
          data.timeoutId = world.time.setTimeout(() => {
            const d = dataAttribute.cursor(eid)
            d.timeoutId = 0
            if (anyPanelOpen || d.isActive) return
            if (!activeCollisions.has(eid)) return

            // Arbitraje por proximidad: comprobar si este marcador es el más cercano al jugador
            if (isClosestMarkerToPlayer(world, eid, playerEid)) {
              triggerActivation()
            }
          }, delay)
        }

        if (delay <= 0) {
          if (isClosestMarkerToPlayer(world, eid, playerEid)) {
            triggerActivation()
          }
        } else {
          startActivationTimer()
        }
      })
      .listen(eid, ecs.physics.COLLISION_END_EVENT, (event: any) => {
        const data = dataAttribute.cursor(eid)
        const schema = schemaAttribute.cursor(eid)

        // Ignorar salidas si no es el jugador
        if (schema.playerTarget && event.data.other !== schema.playerTarget) return

        activeCollisions.delete(eid)

        // Si aún no se había activado (estaba esperando en delay), cancelar el timeout
        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
          data.timeoutId = 0
        }

        // NOTA: Se eliminó la desactivación automática por alejamiento o pérdida de tracking del target.
        // La interfaz permanece bloqueada y activa hasta que el usuario pulse "Salir" o complete el rumor.
      })
      .onExit(() => {
        const data = dataAttribute.get(eid)
        activeCollisions.delete(eid)
        if (data.timeoutId !== 0) {
          world.time.clearTimeout(data.timeoutId)
        }
      })
  },
})