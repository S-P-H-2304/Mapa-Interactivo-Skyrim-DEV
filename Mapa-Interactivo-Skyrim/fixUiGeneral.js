const fs = require('fs')

const file = 'src/Scripts/unlockLocationOnClick.ts'
let content = fs.readFileSync(file, 'utf8')
content = content.replace(/if \(uiGeneral\)/g, 'if (backgroundFrame)')
fs.writeFileSync(file, content)
console.log('Fixed uiGeneral in unlockLocationOnClick.ts')
