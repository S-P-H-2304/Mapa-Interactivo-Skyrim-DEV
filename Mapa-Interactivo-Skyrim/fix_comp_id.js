const fs = require('fs');
const expanseData = JSON.parse(fs.readFileSync('src/.expanse.json', 'utf8'));

const am = Object.values(expanseData.objects).find(o => o.name === 'Audio Manager');
const compKey = Object.keys(am.components).find(k => am.components[k].name === 'restoreProgress');

if (compKey) {
  am.components[compKey].id = compKey;
  fs.writeFileSync('src/.expanse.json', JSON.stringify(expanseData, null, 2));
  console.log('Fijado el ID del componente.');
}
