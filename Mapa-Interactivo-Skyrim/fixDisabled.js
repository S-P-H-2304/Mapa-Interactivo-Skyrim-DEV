const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

let fixedCount = 0

for (const obj of Object.values(expanseData.objects)) {
  // If we mistakenly added a component named 'disabled'
  if (obj.components) {
    const disabledKey = Object.keys(obj.components).find(k => obj.components[k].name === 'disabled')
    if (disabledKey) {
      delete obj.components[disabledKey]
      obj.disabled = true
      fixedCount++
    }
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log(`Fixed ${fixedCount} 'disabled' components back to properties.`)
