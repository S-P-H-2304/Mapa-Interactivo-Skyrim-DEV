const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const getAllDescendants = (parentId) => {
  let descendants = [];
  const children = Object.values(expanseData.objects).filter(o => o.parentId === parentId);
  for (const child of children) {
    descendants.push(child);
    descendants = descendants.concat(getAllDescendants(child.id));
  }
  return descendants;
}

const applyPos = (obj, top, left, width, height) => {
  if (obj && obj.ui) {
    obj.ui.top = top
    obj.ui.left = left
    obj.ui.width = width
    obj.ui.height = height
  }
}

// Standards
const std = {
  libro: { top: 65, left: 156, width: 435, height: 273 },
  titulo: { top: 15, left: 260, width: 230, height: 40 },
  salir: { top: 309, left: 635, width: 100, height: 36 },
  
  // Left page (1 & 3)
  textLeft: { top: 95, left: 205, width: 158, height: 138 },
  btnLeft: { top: 265, left: 200, width: 144, height: 33 },
  antPag: { top: 335, left: 183, width: 100, height: 36 },

  // Right page (2 & 4)
  textRight: { top: 95, left: 391, width: 158, height: 138 },
  btnRight: { top: 265, left: 409, width: 123.75, height: 33 },
  sigPag: { top: 335, left: 470, width: 100, height: 36 }
}

const cities = ['Carrera Blanca', 'Túmulo', 'Aquelarre', 'Tumba', 'Falkreath', 'Gruta']

let modifiedCount = 0;

for (const city of cities) {
  const panel = Object.values(expanseData.objects).find(o => o.name === `UI Rumor ${city}`)
  if (!panel) continue;

  const descendants = getAllDescendants(panel.id)

  for (const obj of descendants) {
    const name = obj.name

    // Skip text objects inside buttons (flexbox)
    if (name.startsWith('Text Continuar')) continue;
    if (name.startsWith('Text (1)')) continue; // usually inside Sig pag/Ant pag
    if (name.startsWith('Icon (1)')) continue;

    if (name.startsWith('Libro ')) applyPos(obj, std.libro.top, std.libro.left, std.libro.width, std.libro.height)
    else if (name.startsWith('Título (1)')) applyPos(obj, std.titulo.top, std.titulo.left, std.titulo.width, std.titulo.height)
    else if (name.startsWith('Atrás ') || name.startsWith('Salir ') || name.startsWith('Salir (1)')) applyPos(obj, std.salir.top, std.salir.left, std.salir.width, std.salir.height)
    
    // Ant/Sig Pag
    else if (name.startsWith('Ant pag')) applyPos(obj, std.antPag.top, std.antPag.left, std.antPag.width, std.antPag.height)
    else if (name.startsWith('Sig pag')) applyPos(obj, std.sigPag.top, std.sigPag.left, std.sigPag.width, std.sigPag.height)

    // Left Page (1 & 3)
    else if (name === `RumorText ${city}`) applyPos(obj, std.textLeft.top, std.textLeft.left, std.textLeft.width, std.textLeft.height)
    else if (name === `Continuar Boton ${city}`) applyPos(obj, std.btnLeft.top, std.btnLeft.left, std.btnLeft.width, std.btnLeft.height)
    else if (name === `RumorText 3 ${city}`) applyPos(obj, std.textLeft.top, std.textLeft.left, std.textLeft.width, std.textLeft.height)
    else if (name === `Continuar Boton 3 ${city}`) applyPos(obj, std.btnLeft.top, std.btnLeft.left, std.btnLeft.width, std.btnLeft.height)
    
    // Right Page (2 & 4)
    else if (name === `RumorText 2 ${city}`) applyPos(obj, std.textRight.top, std.textRight.left, std.textRight.width, std.textRight.height)
    else if (name === `Continuar Boton 2 ${city}`) applyPos(obj, std.btnRight.top, std.btnRight.left, std.btnRight.width, std.btnRight.height)
    else if (name === `RumorText 4 ${city}`) applyPos(obj, std.textRight.top, std.textRight.left, std.textRight.width, std.textRight.height)
    else if (name === `Continuar Boton 4 ${city}`) applyPos(obj, std.btnRight.top, std.btnRight.left, std.btnRight.width, std.btnRight.height)
    
    modifiedCount++
  }
}

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Processed', modifiedCount, 'objects.')
