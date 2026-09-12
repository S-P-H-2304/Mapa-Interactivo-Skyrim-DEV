const fs = require('fs');

const cities = JSON.parse(fs.readFileSync('cities_data.json', 'utf8'));

const falkreath = cities.find(c => c.name === 'Falkreath');
falkreath.rumors = [
  { text: 'Al entrar a Falkreath escuchas recitar unos ritos funerarios. Al acercarte, ves a una afligida pareja llorando frente a una tumba. Preguntas qué pasó y te hablan del asesinato de su pequeña hija, Lavinia a manos de Sinding que está encerrado en los cuarteles.', btnText: 'CONTINUAR' },
  { text: 'Decides ir a la celda a escuchar a Sinding. Cuando hablas con él sobre el ataque, te menciona un anillo maldito que lo obligó a cometer el crimen. Sinding te entrega el anillo y te pide que lo ayudes a eliminar la maldición...', btnText: 'CONTINUAR' },
  { text: '...pero ten cuidado, ¡el anillo está maldito y podrías transformarte en una bestia en cualquier momento! Al salir de los cuarteles ves un ciervo blanco. Un instinto te pide que lo caces.', btnText: 'CONTINUAR' },
  { text: 'Cuando lo mates, el espíritu de Hircine se manifestará y te pedirá que cumplas una cacería por él.', btnText: 'QUE INICIE LA CAZA', unlockLocation: { name: 'Gruta del Hombre Hinchado', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerName: 'Gruta' } }
];

fs.writeFileSync('cities_data.json', JSON.stringify(cities, null, 2));
console.log('Updated Falkreath in cities_data.json');
