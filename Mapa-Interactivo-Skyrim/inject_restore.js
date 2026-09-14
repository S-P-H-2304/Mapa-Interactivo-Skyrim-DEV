const fs = require('fs');
const expanseData = JSON.parse(fs.readFileSync('src/.expanse.json', 'utf8'));

const audioManager = Object.values(expanseData.objects).find(o => o.name === 'Audio Manager');
if (audioManager) {
  if (!audioManager.components) audioManager.components = {};
  
  // Generate a random UUID for the component key
  const compId = require('crypto').randomUUID();
  
  audioManager.components[compId] = {
    name: "restoreProgress",
    parameters: {
      markerTumulo: { type: "entity", id: "0f3a3eb0-58f6-417c-a080-0072c55c600f" },
      markerAquelarre: { type: "entity", id: "d8df7945-6bf4-4160-98fb-b36cbc56eb3f" },
      markerTumba: { type: "entity", id: "26daa6ab-8949-416d-8c69-e6ee9977eaed" },
      markerGruta: { type: "entity", id: "4a8454ed-6fbf-47d1-ae61-45889f692798" }
    }
  };
  
  fs.writeFileSync('src/.expanse.json', JSON.stringify(expanseData, null, 2));
  console.log("Inyectado exitosamente en Audio Manager!");
} else {
  console.log("Audio Manager no encontrado!");
}
