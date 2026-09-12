const fs = require('fs')
const path = require('path')

const filesToUpdate = [
  'src/Scripts/playerInteraction.ts',
  'src/Scripts/playerInteractionTest.ts',
  'src/Scripts/toggleVisibilityOnClick.ts',
  'src/Scripts/unlockLocationOnClick.ts'
]

for (const f of filesToUpdate) {
  let content = fs.readFileSync(f, 'utf8')
  
  // Replace schema keys
  content = content.replace(/generalUi:\s*ecs\.eid/g, 'backgroundFrame: ecs.eid')
  content = content.replace(/uiGeneral:\s*ecs\.eid/g, 'backgroundFrame: ecs.eid')
  content = content.replace(/resetOpacityTarget:\s*ecs\.eid/g, 'backgroundFrame: ecs.eid')
  
  // Replace destructured keys
  content = content.replace(/generalUi(\s*[,}])/g, 'backgroundFrame$1')
  content = content.replace(/uiGeneral(\s*[,}])/g, 'backgroundFrame$1')
  content = content.replace(/resetOpacityTarget(\s*[,}])/g, 'backgroundFrame$1')
  
  // Replace usages in Ui.set
  content = content.replace(/generalUi,/g, 'backgroundFrame,')
  content = content.replace(/uiGeneral,/g, 'backgroundFrame,')
  content = content.replace(/resetOpacityTarget,/g, 'backgroundFrame,')
  
  fs.writeFileSync(f, content)
}

console.log('Scripts updated to use backgroundFrame')
