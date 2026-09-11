import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
    name: 'pressHoldFeedback',
    schema: {
        pressedScale: ecs.f32,
    },
    schemaDefaults: {
        pressedScale: 0.9,
    },
    stateMachine: ({ world, eid, schemaAttribute }) => {
        ecs.defineState('default')
            .initial()
            .listen(eid, ecs.input.UI_PRESSED, () => {
                const { pressedScale } = schemaAttribute.get(eid)
                world.setScale(eid, pressedScale, pressedScale, pressedScale)
            })
            .listen(eid, ecs.input.UI_RELEASED, () => {
                world.setScale(eid, 1, 1, 1)
            })
    },
})