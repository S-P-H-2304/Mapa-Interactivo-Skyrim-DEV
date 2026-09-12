const fs = require('fs')
const crypto = require('crypto')

const expansePath = '.expanse.json.bak'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const uuid = () => crypto.randomUUID()

const tplUiGeneralId = 'a54faf48-4607-4acc-b464-34879c8cac78'
const tplRootId = '88453035-dc0f-486d-868a-8ff7c2fda864'
const tplUiUbiId = 'f851be6c-7f6b-4fc4-9cf5-7de203845568'
const tplUiRumorId = 'a3828348-7945-4330-9d8a-ba310a783670'
const newLocPanelId = '57300f21-0ba5-4056-bd67-6fd11acbc745'
const newLocImageId = '00dcd921-eff0-463b-89f0-3ea9f9e4ffa7'
const newLocNameId = '02257a0f-f15f-4661-ad15-2f6ea61b47a9'

function cloneTree(rootId, newParentId) {
  const map = {}
  const cloneObjects = []
  
  function crawl(currentId, parentId) {
    const orig = expanseData.objects[currentId]
    if (!orig) return null
    const newId = uuid()
    map[currentId] = newId
    
    const clone = JSON.parse(JSON.stringify(orig))
    clone.id = newId
    clone.parentId = parentId
    cloneObjects.push(clone)
    
    const children = Object.values(expanseData.objects).filter(o => o.parentId === currentId)
    for (const child of children) {
      crawl(child.id, newId)
    }
    return newId
  }
  
  crawl(rootId, newParentId)
  
  for (const obj of cloneObjects) {
    if (obj.components) {
      for (const compId of Object.keys(obj.components)) {
        const comp = obj.components[compId]
        if (comp.parameters) {
          for (const key of Object.keys(comp.parameters)) {
            const param = comp.parameters[key]
            if (param && param.type === 'entity' && param.id && map[param.id]) {
              param.id = map[param.id]
            }
          }
        }
      }
    }
  }
  
  return { cloneObjects, map, rootId: map[rootId] }
}

const findEntityByName = (nameIncludes, objs) => objs.find(o => o.name.includes(nameIncludes))
const updateUiText = (obj, text) => { if (obj && obj.ui) obj.ui.text = text }
const addComponent = (obj, compName, params) => {
  if (!obj.components) obj.components = {}
  const cid = uuid()
  obj.components[cid] = { id: cid, name: compName, parameters: params }
}

const allObjectsArray = Object.values(expanseData.objects)
const getMarkerForCity = (cityName) => {
  let marker = allObjectsArray.find(o => o.name === `${cityName} Marcador`)
  if (!marker) marker = allObjectsArray.find(o => o.name.includes(cityName) && o.name.includes('Marcador'))
  return marker
}

const cities = [
  {
    name: 'Riften',
    cuerpo: 'Sede de la hidromielería Espino Negro, Riften es una ciudad situada en la esquina sureste de La Grieta, en el extremo oriental del Lago Honrich. Su geografía obliga a que una buena parte de la ciudad se extienda sobre el agua en grandes muelles de madera. La ciudad se encuentra dividida por un gran canal que solía servir como acceso comercial. Sin embargo, ahora es el hogar de la chusma y una entrada a las cloacas en las que se rumorea que se establece la sede del infame Gremio de Ladrones.\nLa Jarl a cargo de Riften es Laila la Legisladora. Sin embargo, es un secreto a voces que Maven Espino Negro, la cabeza de familia es quien realmente controla todo aquello que sucede en la ciudad.',
    notas: '- Es posible comprar una propiedad llamada “Villa Melosa” por 8000 septims.\n- Ten cuidado con símbolos extraños cerca de casas o alijos, podría ser parte de un extraño lenguaje del Gremio de Ladrones.\n- Sé precavido con lo que dices y haces en Riften. Maven Espino Negro lo escucha y sabe todo.',
    rumors: []
  },
  {
    name: 'Morthal',
    cuerpo: 'Ubicada en el corazón de la sombría marisma de la Marca del Hjaal, Morthal es una pequeña y aislada capital rodeada de una perpetua niebla, ciénagas traicioneras y aguas estancadas. Es liderada por la jarl Idgrod Cuervo Marino, una anciana respetada pero temida por sus visiones místicas y supuestos poderes clarividentes. El pueblo vive sumido en la paranoia y la superstición, alimentadas por la trágica quema reciente de una vivienda local y la amenaza constante de criaturas que acechan en los pantanos.',
    notas: '- Hubo un incendio en una de las casas de la ciudad, los lugareños afirman escuchar risas infantiles y ver sombras extrañas merodeando entre las cenizas por la noche.\n- Dicen que el ermitaño Falion realiza extraños rituales en los pantanos al caer la luna, y que sus conocimientos oscuros pueden revertir incluso las peores aflicciones de la sangre.\n- Los cazadores locales advierten no adentrarse en la niebla sin antorchas ni armas de plata: algo mucho más peligroso e inteligente que los fuegos fatuos parece estar acechando desde las cuevas cercanas.',
    rumors: []
  },
  {
    name: 'Markarth',
    cuerpo: 'Construida enteramente sobre las ruinas de piedra de la colosal fortaleza enana de Nchuand-Zel, Markarth es la capital de La Cuenca y una de las ciudades más imponentes y verticales de Skyrim. Está gobernada por el jarl Igmund desde la majestuosa Fortaleza de Piedra Baja. Tras sus imponentes muros dorados de cantería y su lucrativa Mina de Cidhna, la ciudad sufre una sangrienta guerra encubierta entre los guardias locales, la influyente familia Sangre de Plata y los rebeldes nativos conocidos como los Renegados.',
    notas: '- Mantente alerta en el mercado, circulan rumores de que cualquiera a tu alrededor podría ser un espía de los Renegados esperando el momento justo para dar un golpe mortal.\n- Cuentan que nadie sale con vida de la Mina de Cidhna, pero los prisioneros veteranos susurran historias sobre un viejo líder que controla la cárcel desde las sombras más profundas de la roca.\n- Hay rumores de ruidos metálicos y vapores extraños saliendo de las zonas clausuradas de la fortaleza, el erudito de la corte parece estar buscando aventureros lo bastante temerarios para investigar las ruinas enanas selladas.',
    rumors: []
  },
  {
    name: 'Lucero del Alba',
    cuerpo: 'Antiguo campamento de la Compañía Minera de Roca Negra convertido en un austero puerto pesquero y minero, Lucero del Alba es la capital de la comarca de El Pálido. Está gobernada por el veterano jarl Escaldo el Sabio, un ferviente partidario de los Capas de la Tormenta que gobierna desde el Salón de la Cumbre Blanca. La ciudad basa su economía en sus dos ricas minas de hierro y azogue, aunque el frío glacial y el constante azote del Mar de los Fantasmas la convierten en uno de los lugares más inhóspitos para vivir en toda la provincia.',
    notas: '- Un insomnio colectivo azota a todos los habitantes con pesadillas recurrentes deberías de preguntar en la posada sobre este misterio.\n- Se dice que cerca a la ciudad se encuentra una puerta negra que te susurra, los rumores dicen que si le dices las palabras correctas la puerta se abrirá.\n- Si necesitas ingredientes alquímicos poco comunes del norte marino (como grasa de troll de las nieves o sales polares), revisa las costas rocosas y los barcos atracados al amanecer.',
    rumors: []
  },
  {
    name: 'Soledad',
    cuerpo: 'También conocida como Haafingar, Soledad es la capital imperial en Skyrim, caracterizada por tener uno de los puertos más importantes no solo de Skyrim sino de todo Tamriel. Además es el hogar del famoso Colegio de Bardos, un gremio de bardos y oradores liderado por Viarmo. Soledad es liderada por la jarl Elisif La Justa, y reside en el Palacio Azul, hogar de los reyes de Skyrim.',
    notas: '- Soledad es una ciudad imperial, por lo que cualquier afiliación o apoyo a los Capa de la Tormenta es severamente castigado, llegando a ser condenado con decapitación.\n- Cerca del Castillo Severo hay un patio de entrenamiento donde los guardias entrenan sus habilidades de arquería, normalmente dejan muchas flechas sin supervisión, por lo que puede ser una buena fuente de munición.\n- Soledad tiene muchas entradas públicas, sin embargo, cerca del puente del puerto hay una entrada secreta que lleva directamente a la ciudad y puede ser usada cuando necesitas tener el sigilo de tu lado.',
    rumors: []
  },
  {
    name: 'Ventalia',
    cuerpo: 'Considerada la ciudad humana más antigua que aún sigue en pie en todo Tamriel, Ventalia es la capital de la Marca Oriental y el bastión principal de la rebelión de los Capas de la Tormenta. Es gobernada por el jarl Ulfric Capa de la Tormenta desde el imponente Palacio de los Reyes, una de las pocas estructuras que sobrevivió al Gran Colapso del pasado nórdico. La ciudad está marcada por fuertes tensiones raciales y sociales, dividiendo a su población entre los nórdicos tradicionales y los elfos oscuros marginados en el Barrio Gris, además de los argonianos relegados al exterior de las murallas en la Ensambladura de Ventalia.',
    notas: '- Es posible adquirir la propiedad "Hjerim" por 12.000 septims a Jorleif, aunque tendrás que demostrar al jarl con tus acciones que eres de confianza.\n- El racismo y el nacionalismo nórdico son palpables en cada esquina; mostrar simpatía por el Imperio o el Dominio de Aldmer dentro de sus murallas te ganará el desprecio inmediato de la guardia y los ciudadanos.\n- Prepárate para ir abrigado ya que Ventalia siempre está cubierta de nieve al estar cerca de la parte más fría de todo Skyrim.',
    rumors: []
  },
  {
    name: 'Hibernalia',
    cuerpo: 'Alguna vez una de las capitales más prósperas, ricas y poderosas de Skyrim, Hibernalia es hoy una sombra de su pasado tras el desastre mágico conocido como el Gran Colapso, evento que destruyó la mayor parte del asentamiento arrojándolo al Mar de los Fantasmas. Es liderada por el jarl Korir desde el Salón Comunal del Jarl, quien mantiene un profundo resentimiento y desconfianza hacia la única estructura que quedó intacta tras la catástrofe: el Colegio de Hibernalia.',
    notas: '- A diferencia de otras comarcas principales, Hibernalia no cuenta con una propiedad residencial para comprar; el único alojamiento permanente disponible se obtiene uniéndose al Colegio de Hibernalia en los aposentos para estudiantes.\n- El Colegio de Hibernalia es el centro definitivo para el aprendizaje arcano en la provincia, albergando al Archimago Savos Aren y a maestros entrenadores de todas las escuelas de magia.\n- Debido al clima ártico extremo y su aislamiento geográfico, los comerciantes escasean; la taberna "El hogar helado" y el almacén de Birna son prácticamente los únicos puntos de comercio de la aldea exterior.',
    rumors: []
  },
  {
    name: 'Carrera Blanca',
    cuerpo: 'Alguna vez considerada “La Ciudad Imperial de Skyrim”, Carrera Blanca es la capital de la Comarca de Carrera Blanca en la provincia de Skyrim. Es liderada por el jarl Balgruuf el Grande quien ha llevado a la ciudad a perder el prestigio que alguna vez tuvo, esto por culpa de La Guerra Civil entre los Capa de la Tormenta y el Imperio, los inviernos excesivamente duros y el acoso constante de bandidos. Carrera Blanca es hogar de dos importantes clanes: los Melena Gris y los Batallador.\nCarrera Blanca es también la sede de Los Compañeros situada en Jorrvaskr, un legendario salón de aguamiel.',
    notas: '- Es posible comprar una propiedad llamada “El hogar de la brisa” a Provencio Avenicci por 5000 septims.\n- Ten cuidado con tus ideologías políticas, Carrera Blanca es un territorio muy neutral pero con mucha tensión entre ambos bandos.\n- Si quieres tener las mejores armas y armaduras, no dudes en dirigirte a la Forja del Cielo donde Eorlund Melena Gris forja con el mejor acero de todo Skyrim.',
    rumors: [
      'Mientras caminabas a las afueras de Carrera Blanca escuchaste unos ruidos de lucha provenientes de una granja. Cuando te acercaste viste a un grupo de guerreros derribando a un gigante, ¡ayúdalos!',
      'El grupo de guerreros te elogia y te invita a formar parte de Los Compañeros. Dirígete a Jorrvaskr para hablar con Kodlak Melena Blanca, pero ten cuidado, se rumorea que de allí provienen aullidos extraños en las noches con luna.'
    ],
    unlockLocation: null
  },
  {
    name: 'Falkreath',
    cuerpo: 'Famosa en todo el continente por albergar el cementerio más grande y antiguo de Skyrim, Falkreath es la capital de la comarca homónima, enclavada en los densos y frondosos bosques de pinos del sur. Es liderada por el joven y arrogante jarl Siddgeir, quien prefiere el lujo y los acuerdos turbios con bandidos locales antes que la administración de su pueblo. Sus habitantes viven en estrecha cercanía con la muerte y el luto, reflejándolo en sus nombres de negocios y en el respeto solemne hacia sus caídos.',
    notas: '- Los guardias comentan en voz baja que hay un prisionero en las celdas con una fuerza sobrehumana, encerrado tras un brutal suceso relacionado con una bestia salvaje en los bosques.\n- El herrero del pueblo y varios guardias aseguran haber visto un perro inusualmente inteligente rondando los caminos exteriores, y muchos creen que seguir a ese animal lleva a un destino misterioso.\n- Corren leyendas entre los leñadores sobre un cementerio olvidado en la espesura donde los cazadores desaparecen sin dejar rastro si se atreven a perturbar la fauna sagrada del bosque.',
    rumors: [
      'Al entrar a Falkreath escuchas recitar unos ritos funerarios. Al acercarte, ves a una afligida pareja llorando frente a una tumba. Preguntas qué pasó y te hablan del asesinato de su pequeña hija, Lavinia a manos de Sinding que está encerrado en los cuarteles.\nDecides ir a la celda a escuchar a Sinding. Cuando hablas con él sobre el ataque, te menciona un anillo maldito que lo obligó a cometer el crimen. Sinding te entrega el anillo y te pide que lo ayudes a eliminar la maldición, pero ten cuidado, ¡el anillo está maldito y podrías transformarte en una bestia en cualquier momento!\nAl salir de los cuarteles ves un ciervo blanco. Un instinto te pide que lo caces. Cuando lo mates, el espíritu de Hircine se manifestará y te pedirá que cumplas una cacería por él.'
    ],
    unlockLocation: { name: 'Gruta del Hombre Hinchado', image: 'assets/Iconos/UI/Cueva.png' }
  },
  {
    name: 'Túmulo del Hombre de Polvo',
    cuerpo: 'Antigua tumba nórdica situada al sureste de Morthal. Dentro de la tumba habitan criaturas peligrosas como los Draugr y las arañas. Hay quienes dicen haber escuchado voces humanas dentro.',
    notas: '- Se dice que allí yace uno de los fragmentos del hacha legendaria y ancestral de Los Compañeros.\n- La tumba está sellada. Tal vez un miembro de Los Compañeros tenga una llave para acceder.\n- La tumba parece estar relacionada con Ysgramor, el otrora mítico líder de Los Compañeros.',
    rumors: [
      'Aún no eres un miembro pleno de Los Compañeros. Fuiste enviado a este lugar para recuperar un fragmento de la legendaria hacha Wuuthrad, que perteneció a Ysgramor. Farkas te acompañará en esta misión como tu compañero de escudo.',
      'Haces un dueto perfecto con Farkas. Ningún enemigo, por peligroso que sea, ha podido atravesar sus defensas. Llegan a una habitación con una reja cerrada. Te acercas a una palanca. Crees que abrirá el camino, pero en su lugar te encierra y te separa de Farkas. Miembros de la Mano de Plata lo rodean y entonces lo ves: un hombre lobo real.',
      'Tras el descubrimiento sobre Farkas y los compañeros, te adentras más en la tumba hasta que obtienes el fragmento de la legendaria Wuuthrad.'
    ],
    unlockLocation: { name: 'Aquelarre de Glenmoril', image: 'assets/Iconos/UI/Cueva.png' }
  },
  {
    name: 'Aquelarre de Glenmoril',
    cuerpo: 'Ubicada al oeste de Falkreath, el Aquelarre de Glenmoril refugia a las malvadas Brujas de Glenmoril, responsables de la terrible maldición (o bendición para otros) que acosa al Círculo de Los Compañeros.',
    notas: '- Prepárate bien. Las brujas usarán magia oscura y antigua con poderes devastadores.\n- Afila bien tus espadas y evita la magia, pues su brujería las vuelve especialmente resistentes a los ataques mágicos y de fuego.\n- Ten cuidado con el botín. No existen más que las cinco Brujas de Glenmoril. Utiliza bien sus cabezas.',
    rumors: [
      'Tras unirte al Círculo y contraer la licantropía, Kodlak Melena Blanca acude a ti en busca de ayuda. Te cuenta que ha descubierto cómo curar la licantropía, condición incompatible con Sovngarde. Todo se reduce al origen de la maldición. Debes encontrar a las Brujas de Glenmoril y tomar sus cabezas.',
      'Lograste sobrevivir a la magia oscura de las brujas. Usaste tu propia maldición en su contra y las devoraste hasta que solo quedaron sus cabezas. Es momento de que vuelvas a Jorrvaskr.'
    ],
    unlockLocation: { name: 'Tumba de Ysgramor', image: 'assets/Iconos/UI/Tumba.png' }
  },
  {
    name: 'Tumba de Ysgramor',
    cuerpo: 'Localizada en una isla helada al noroeste de Hibernalia, yacen los restos humanos del mítico y legendario líder de Los Compañeros Ysgramor. Su entrada está bloqueada para la gente corriente.',
    notas: '- Se dice que la estatua de Ysgramor en la entrada protege el acceso y solo permitirá pasar a aquellos que le devuelvan lo que le hace falta.\n- No olvides llevar la Wuuthrad, podría ser de gran utilidad en la tumba de su antiguo dueño.\n- Se dice que en las profundidades de la tumba yacen Ysgramor y sus más acérrimos aliados. Prepárate para luchar contra seres legendarios.',
    rumors: [
      'Regresaste con las cabezas, pero Kodlak había sido asesinado por la Mano de Plata. En un ataque directo y vengativo, acabas con esta facción cazadora de licántropos y te haces con el último fragmento de la Wuuthrad. Es momento de cumplir la última voluntad de Kodlak y que cures a su espíritu de la maldición del Círculo. Tu última parada es el lugar de descanso del antiguo líder de Los Compañeros, Ysgramor.',
      'Conseguiste llegar a las profundidades de la tumba y te encuentras en el gran salón funerario. Invocas al espíritu de Kodlak Melena Blanca, quien te pide que lo cures. Usas una cabeza de Bruja de Glenmoril y la quemas en un pedestal llameante. Verás manifestarse un espíritu con la forma de un lobo, acaba con él y permite que Kodlak descanse en Sovngarde.\n- Si así lo deseas, tú también podrás curar tu licantropía...\n- Podrás mejorar tus poderes licantrópicos con ayuda de Aela...'
    ],
    unlockLocation: null
  },
  {
    name: 'Gruta del Hombre Hinchado',
    cuerpo: 'Localizada al norte de la orilla del Lago Ilinalta se encuentra una cueva rodeada de pequeños acantilados. En su interior yace un santuario dedicado a Talos.',
    notas: '- Presenta tus respetos frente al altar de Talos. Tal vez su bendición te sea útil para el recorrido.\n- Es posible encontrar una espada a los pies del altar de Talos. Perteneció a Acilius Bolar, un cuchilla que murió a manos de los Thalmor.\n- Aullidos y gritos de horror se escuchan ocasionalmente al interior de la gruta. Será mejor que te andes con cuidado.',
    rumors: [
      'Al llegar a la gruta, un aullido y un grito de auxilio te hace estremecer. Al interior de la gruta te espera una cacería de vida o muerte. Te verás cara a cara contra la bestia asesina de Lavinia.',
      'La decisión está en tus manos, Sangre de Dragón, ¿eliminaste a la bestia o la ayudaste a eliminar a los cazadores que la atacaban? Sea como sea, Hircine está satisfecho y una grata recompensa te espera…Que la bendición de Hircine guíe tus garras y que tu presa nunca escape de tu vista.'
    ],
    unlockLocation: null
  }
]

for (const city of cities) {
  if (city.name === 'Carrera Blanca') {
    const origUbi = allObjectsArray.find(o => o.id === tplUiUbiId)
    const origRumor = allObjectsArray.find(o => o.id === tplUiRumorId)
    
    const allChildUbi = allObjectsArray.filter(o => o.parentId === tplUiUbiId)
    updateUiText(findEntityByName('Título', allChildUbi), city.name)
    updateUiText(findEntityByName('Cuerpo', allChildUbi), city.cuerpo)
    updateUiText(findEntityByName('Notas', allChildUbi), city.notas)

    const rumorBtn = findEntityByName('Rumor', allChildUbi)
    if (rumorBtn) {
      addComponent(rumorBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: origRumor.id },
        hideTarget1: { type: 'entity', id: origUbi.id }
      })
    }

    const salirBtn = findEntityByName('Salir', allChildUbi)
    if (salirBtn) {
      addComponent(salirBtn, 'toggleVisibilityOnClick', {
        hideTarget1: { type: 'entity', id: origUbi.id },
        resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
      })
    }

    const allChildRumor = allObjectsArray.filter(o => o.parentId === tplUiRumorId)
    const atrasBtn = findEntityByName('Salir', allChildRumor) || findEntityByName('Atras', allChildRumor)
    if (atrasBtn) {
      atrasBtn.name = `Atras ${city.name}`
      updateUiText(findEntityByName('Text', allObjectsArray.filter(o => o.parentId === atrasBtn.id)), 'Atras')
      addComponent(atrasBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: origUbi.id },
        hideTarget1: { type: 'entity', id: origRumor.id }
      })
    }
    
    const rt1 = findEntityByName('RumorText', allChildRumor)
    const btnCont1 = findEntityByName('Continuar Boton', allChildRumor)
    const rt2 = allChildRumor.find(o => o.name.includes('RumorText') && o.id !== rt1.id)
    
    updateUiText(rt1, city.rumors[0])
    updateUiText(rt2, city.rumors[1])
    
    const btnCont2 = JSON.parse(JSON.stringify(btnCont1))
    btnCont2.id = uuid()
    btnCont2.name = `Continuar Boton 2 ${city.name}`
    btnCont2.ui.top = rt2.ui.top + rt2.ui.height + 20
    btnCont2.ui.left = rt2.ui.left
    
    const btnCont1Child = allObjectsArray.find(o => o.parentId === btnCont1.id)
    const btnCont2Child = JSON.parse(JSON.stringify(btnCont1Child))
    btnCont2Child.id = uuid()
    btnCont2Child.parentId = btnCont2.id
    
    expanseData.objects[btnCont2.id] = btnCont2
    expanseData.objects[btnCont2Child.id] = btnCont2Child

    rt2.disabled = true;
    btnCont2.disabled = true;

    addComponent(btnCont1, 'toggleVisibilityOnClick', {
      showTarget1: { type: 'entity', id: rt2.id },
      showTarget2: { type: 'entity', id: btnCont2.id },
      hideTarget1: { type: 'entity', id: btnCont1.id }
    })

    addComponent(btnCont2, 'toggleVisibilityOnClick', {
      hideTarget1: { type: 'entity', id: origRumor.id },
      resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
    })

    continue
  }

  const ubiCloneInfo = cloneTree(tplUiUbiId, tplRootId)
  const ubiPanelId = ubiCloneInfo.rootId
  const ubiPanel = ubiCloneInfo.cloneObjects.find(o => o.id === ubiPanelId)
  ubiPanel.name = `UI Ubicación ${city.name}`
  
  const ubiChildren = ubiCloneInfo.cloneObjects.filter(o => o.parentId === ubiPanelId)
  updateUiText(findEntityByName('Título', ubiChildren), city.name)
  updateUiText(findEntityByName('Cuerpo', ubiChildren), city.cuerpo)
  updateUiText(findEntityByName('Notas', ubiChildren), city.notas)

  const salirBtn = findEntityByName('Salir', ubiChildren)
  addComponent(salirBtn, 'toggleVisibilityOnClick', {
    hideTarget1: { type: 'entity', id: ubiPanelId },
    resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
  })

  const marker = getMarkerForCity(city.name)
  if (marker) {
    let pIntKey = Object.keys(marker.components || {}).find(k => marker.components[k].name === 'playerInteraction')
    if (pIntKey) {
      marker.components[pIntKey].parameters.uiPanel = { type: 'entity', id: ubiPanelId }
    }
  }

  if (city.rumors && city.rumors.length > 0) {
    const rumorCloneInfo = cloneTree(tplUiRumorId, tplRootId)
    const rumorPanelId = rumorCloneInfo.rootId
    const rumorPanel = rumorCloneInfo.cloneObjects.find(o => o.id === rumorPanelId)
    rumorPanel.name = `UI Rumor ${city.name}`

    const rumorBtn = findEntityByName('Rumor', ubiChildren)
    addComponent(rumorBtn, 'toggleVisibilityOnClick', {
      showTarget1: { type: 'entity', id: rumorPanelId },
      hideTarget1: { type: 'entity', id: ubiPanelId }
    })

    const rumorChildren = rumorCloneInfo.cloneObjects.filter(o => o.parentId === rumorPanelId)
    const atrasBtn = findEntityByName('Salir', rumorChildren) || findEntityByName('Atras', rumorChildren)
    if (atrasBtn) {
      atrasBtn.name = `Atras ${city.name}`
      updateUiText(findEntityByName('Text', rumorCloneInfo.cloneObjects.filter(o => o.parentId === atrasBtn.id)), 'Atras')
      addComponent(atrasBtn, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: ubiPanelId },
        hideTarget1: { type: 'entity', id: rumorPanelId }
      })
    }

    const rt1 = findEntityByName('RumorText', rumorChildren)
    const btnCont1 = findEntityByName('Continuar Boton', rumorChildren)
    const rt2 = rumorChildren.find(o => o.name.includes('RumorText') && o.id !== rt1.id)
    
    updateUiText(rt1, city.rumors[0])
    
    if (city.rumors.length === 1) {
      rt2.disabled = true;
      
      if (city.unlockLocation) {
        addComponent(btnCont1, 'unlockLocationOnClick', {
          panelToHide: { type: 'entity', id: rumorPanelId },
          uiGeneral: { type: 'entity', id: tplUiGeneralId },
          uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
          imageElement: { type: 'entity', id: newLocImageId },
          nameElement: { type: 'entity', id: newLocNameId },
          imageSrc: city.unlockLocation.image,
          locationName: city.unlockLocation.name
        })
      } else {
        addComponent(btnCont1, 'toggleVisibilityOnClick', {
          hideTarget1: { type: 'entity', id: rumorPanelId },
          resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
        })
      }
    } else {
      updateUiText(rt2, city.rumors[1])
      
      const btnCont2 = JSON.parse(JSON.stringify(btnCont1))
      btnCont2.id = uuid()
      btnCont2.name = `Continuar Boton 2 ${city.name}`
      btnCont2.ui.top = rt2.ui.top + rt2.ui.height + 20
      btnCont2.ui.left = rt2.ui.left
      
      const btnCont1ChildOrig = rumorCloneInfo.cloneObjects.find(o => o.parentId === btnCont1.id)
      const btnCont2Child = JSON.parse(JSON.stringify(btnCont1ChildOrig))
      btnCont2Child.id = uuid()
      btnCont2Child.parentId = btnCont2.id
      
      rumorCloneInfo.cloneObjects.push(btnCont2, btnCont2Child)
      
      rt2.disabled = true;
      btnCont2.disabled = true;

      addComponent(btnCont1, 'toggleVisibilityOnClick', {
        showTarget1: { type: 'entity', id: rt2.id },
        showTarget2: { type: 'entity', id: btnCont2.id },
        hideTarget1: { type: 'entity', id: btnCont1.id }
      })

      if (city.rumors.length === 2) {
        if (city.unlockLocation) {
          addComponent(btnCont2, 'unlockLocationOnClick', {
            panelToHide: { type: 'entity', id: rumorPanelId },
            uiGeneral: { type: 'entity', id: tplUiGeneralId },
            uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
            imageElement: { type: 'entity', id: newLocImageId },
            nameElement: { type: 'entity', id: newLocNameId },
            imageSrc: city.unlockLocation.image,
            locationName: city.unlockLocation.name
          })
        } else {
          addComponent(btnCont2, 'toggleVisibilityOnClick', {
            hideTarget1: { type: 'entity', id: rumorPanelId },
            resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
          })
        }
      } else {
        const rt3 = JSON.parse(JSON.stringify(rt1))
        rt3.id = uuid()
        rt3.name = `RumorText 3 ${city.name}`
        updateUiText(rt3, city.rumors[2])
        rt3.disabled = true;

        const btnCont3 = JSON.parse(JSON.stringify(btnCont1))
        btnCont3.id = uuid()
        btnCont3.name = `Continuar Boton 3 ${city.name}`
        
        const btnCont3Child = JSON.parse(JSON.stringify(btnCont1ChildOrig))
        btnCont3Child.id = uuid()
        btnCont3Child.parentId = btnCont3.id
        btnCont3.disabled = true;

        rumorCloneInfo.cloneObjects.push(rt3, btnCont3, btnCont3Child)

        addComponent(btnCont2, 'toggleVisibilityOnClick', {
          showTarget1: { type: 'entity', id: rt3.id },
          showTarget2: { type: 'entity', id: btnCont3.id },
          hideTarget1: { type: 'entity', id: rt1.id },
          hideTarget2: { type: 'entity', id: btnCont2.id }
        })
        
        const compName2 = `toggleVisibilityOnClick_${uuid()}`
        btnCont2.components[compName2] = {
          id: compName2,
          name: 'toggleVisibilityOnClick',
          parameters: { hideTarget1: { type: 'entity', id: rt2.id } }
        }

        if (city.unlockLocation) {
          addComponent(btnCont3, 'unlockLocationOnClick', {
            panelToHide: { type: 'entity', id: rumorPanelId },
            uiGeneral: { type: 'entity', id: tplUiGeneralId },
            uiNuevaUbicacion: { type: 'entity', id: newLocPanelId },
            imageElement: { type: 'entity', id: newLocImageId },
            nameElement: { type: 'entity', id: newLocNameId },
            imageSrc: city.unlockLocation.image,
            locationName: city.unlockLocation.name
          })
        } else {
          addComponent(btnCont3, 'toggleVisibilityOnClick', {
            hideTarget1: { type: 'entity', id: rumorPanelId },
            resetOpacityTarget: { type: 'entity', id: tplUiGeneralId }
          })
        }
      }
    }

    rumorCloneInfo.cloneObjects.forEach(o => { expanseData.objects[o.id] = o })
    rumorPanel.disabled = true;
  } else {
    const rumorBtn = findEntityByName('Rumor', ubiChildren)
    if (rumorBtn) {
      const rmBtnChildren = ubiCloneInfo.cloneObjects.filter(o => o.parentId === rumorBtn.id)
      rmBtnChildren.forEach(o => { delete expanseData.objects[o.id] })
      
      const idx = ubiCloneInfo.cloneObjects.findIndex(o => o.id === rumorBtn.id)
      if (idx !== -1) ubiCloneInfo.cloneObjects.splice(idx, 1)
    }
  }

  ubiPanel.disabled = true;
  ubiCloneInfo.cloneObjects.forEach(o => { expanseData.objects[o.id] = o })
}

const origUbi = expanseData.objects[tplUiUbiId]
origUbi.disabled = true;
const origRumor = expanseData.objects[tplUiRumorId]
origRumor.disabled = true;

fs.writeFileSync('src/.expanse.json', JSON.stringify(expanseData, null, 2))
console.log('Expanse correctly injected from backup with valid disabled properties.')
