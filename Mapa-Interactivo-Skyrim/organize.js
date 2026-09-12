const fs = require('fs')

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const shortNamesMap = {
  'Túmulo del Hombre de Polvo': 'Túmulo',
  'Aquelarre de Glenmoril': 'Aquelarre',
  'Tumba de Ysgramor': 'Tumba',
  'Gruta del Hombre Hinchado': 'Gruta',
  'Lucero del Alba': 'Lucero',
  'Lucero de Alba': 'Lucero',
  'Carrera Blanca': 'Carrera Blanca',
  'Falkreath': 'Falkreath',
  'Riften': 'Riften',
  'Morthal': 'Morthal',
  'Markarth': 'Markarth',
  'Soledad': 'Soledad',
  'Ventalia': 'Ventalia',
  'Hibernalia': 'Hibernalia'
}

// Function to find the short name given a string containing the city name
function getShortName(str) {
  for (const [full, short] of Object.entries(shortNamesMap)) {
    if (str.includes(full) || str.includes(short)) return short;
  }
  return null;
}

// Clean name function to remove existing suffixes to avoid duplication
function cleanBaseName(name, shortName) {
  let base = name;
  for (const [full, short] of Object.entries(shortNamesMap)) {
    base = base.replace(new RegExp(' ' + full + '$'), '');
    base = base.replace(new RegExp(' ' + short + '$'), '');
  }
  return base.trim();
}

function processTree(nodeId, shortName, isRumor) {
  const node = expanseData.objects[nodeId];
  if (!node) return;

  const children = Object.values(expanseData.objects).filter(o => o.parentId === nodeId);
  
  children.forEach(child => {
    let baseName = cleanBaseName(child.name, shortName);
    
    // Special handling for generic children (Icon, Text)
    if (baseName === 'Icon' || baseName === 'Text' || baseName === 'Image' || baseName === 'Boton Texto') {
       let parentBase = cleanBaseName(node.name, shortName);
       // e.g. "Text" inside "Salir" -> "Text Salir"
       // e.g. "Boton Texto" inside "Continuar Boton 2" -> "Text Continuar Boton 2"
       baseName = `${baseName} ${parentBase}`;
    }
    
    // Some manual cleanups
    baseName = baseName.replace('Boton Texto', 'Text');
    
    child.name = `${baseName} ${shortName}`;
    
    processTree(child.id, shortName, isRumor);
  });
}

// 1. Rename UI Panels
Object.values(expanseData.objects).forEach(obj => {
  if (obj.name.startsWith('UI Ubicación ') || obj.name.startsWith('UI Rumor ') || obj.name.startsWith('UI Carrera Blanca')) {
    const isRumor = obj.name.includes('Rumor');
    const shortName = getShortName(obj.name);
    
    if (shortName) {
      if (isRumor) {
        obj.name = `UI Rumor ${shortName}`;
      } else {
        obj.name = `UI Ubicación ${shortName}`;
      }
      processTree(obj.id, shortName, isRumor);
    }
  }
});

// 2. Rename Nueva Ubicación elements
const newLocPanel = Object.values(expanseData.objects).find(o => o.name === 'UI Nueva Ubicación');
if (newLocPanel) {
  const children = Object.values(expanseData.objects).filter(o => o.parentId === newLocPanel.id);
  children.forEach(c => {
    if (c.name.includes('Logo')) c.name = 'Logo Desbloqueo';
    if (c.name.includes('Título')) c.name = 'Alerta Desbloqueo';
    if (c.name.includes('Titulo')) c.name = 'Nombre Ciudad Desbloqueo'; // The one that says "Carrera Blanca"
    if (c.name.includes('Continuar Boton')) {
       c.name = 'Boton Continuar Desbloqueo';
       const textChild = Object.values(expanseData.objects).find(tc => tc.parentId === c.id);
       if (textChild) textChild.name = 'Text Boton Continuar Desbloqueo';
    }
  });
}

// 3. Estandarizar Marcadores
Object.values(expanseData.objects).forEach(obj => {
  if (obj.name.includes('Marcador') && !obj.name.startsWith('Marcador ')) {
     const shortName = getShortName(obj.name);
     if (shortName) {
       obj.name = `Marcador ${shortName}`;
     }
  }
});

fs.writeFileSync(expansePath, JSON.stringify(expanseData, null, 2))
console.log('Hierarchy organized successfully!')
