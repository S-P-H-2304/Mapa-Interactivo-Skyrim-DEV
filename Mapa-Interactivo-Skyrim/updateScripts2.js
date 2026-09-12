const fs = require('fs')

const filesToUpdate = [
  'src/Scripts/playerInteraction.ts',
  'src/Scripts/playerInteractionTest.ts'
]

for (const f of filesToUpdate) {
  let content = fs.readFileSync(f, 'utf8')
  content = content.replace(/schema\.generalUi/g, 'schema.backgroundFrame')
  fs.writeFileSync(f, content)
}

console.log('Fixed schema.generalUi -> schema.backgroundFrame')
