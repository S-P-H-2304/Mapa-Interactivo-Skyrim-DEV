import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'debugOverlay',
  add: (world, component) => {
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '100vw'
    div.style.maxHeight = '40vh'
    div.style.overflow = 'hidden'
    div.style.background = 'rgba(0,0,0,0.75)'
    div.style.color = '#00ff00'
    div.style.fontSize = '12px'
    div.style.fontFamily = 'monospace'
    div.style.zIndex = '99999'
    div.style.padding = '4px'
    div.style.pointerEvents = 'none'
    document.body.appendChild(div)

    const lines: string[] = []
    ;(window as any).debugLog = (msg: string) => {
      lines.push(msg)
      if (lines.length > 10) lines.shift()
      div.innerText = lines.join('\n')
    }
  },
})