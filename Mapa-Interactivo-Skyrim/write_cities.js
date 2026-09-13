const fs = require('fs')
const crypto = require('crypto')
const uuid = () => crypto.randomUUID()

const expansePath = 'src/.expanse.json'
const expanseData = JSON.parse(fs.readFileSync(expansePath, 'utf8'))

const cities = [
  {
    name: 'Riften',
    cuerpo: 'Sede de la hidromielería Espino Negro, Riften es una ciudad situada en la esquina sureste de La Grieta, en el extremo oriental del Lago Honrich. Su geografía obliga a que una buena parte de la ciudad se extienda sobre el agua en grandes muelles de madera. La ciudad se encuentra dividida por un gran canal que solía servir como acceso comercial. Sin embargo, ahora es el hogar de la chusma y una entrada a las cloacas en las que se rumorea que se establece la sede del infame Gremio de Ladrones.\nLa Jarl a cargo de Riften es Laila la Legisladora. Sin embargo, es un secreto a voces que Maven Espino Negro, la cabeza de familia es quien realmente controla todo aquello que sucede en la ciudad.',
    notas: '- Es posible comprar una propiedad llamada "Villa Melosa" por 8000 septims.\n\n- Ten cuidado con símbolos extraños cerca de casas o alijos, podría ser parte de un extraño lenguaje del Gremio de Ladrones.\n\n- Sé precavido con lo que dices y haces en Riften. Maven Espino Negro lo escucha y sabe todo.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Riften',
  },
  {
    name: 'Morthal',
    cuerpo: 'Ubicada en el corazón de la sombría marisma de la Marca del Hjaal, Morthal es una pequeña y aislada capital rodeada de una perpetua niebla, ciénagas traicioneras y aguas estancadas. Es liderada por la jarl Idgrod Cuervo Marino, una anciana respetada pero temida por sus visiones místicas y supuestos poderes clarividentes. El pueblo vive sumido en la paranoia y la superstición, alimentadas por la trágica quema reciente de una vivienda local y la amenaza constante de criaturas que acechan en los pantanos.',
    notas: '- Hubo un incendio en una de las casas de la ciudad, los lugareños afirman escuchar risas infantiles y ver sombras extrañas merodeando entre las cenizas por la noche.\n\n- Dicen que el ermitaño Falion realiza extraños rituales en los pantanos al caer la luna, y que sus conocimientos oscuros pueden revertir incluso las peores aflicciones de la sangre.\n\n- Los cazadores locales advierten no adentrarse en la niebla sin antorchas ni armas de plata: algo mucho más peligroso e inteligente que los fuegos fatuos parece estar acechando desde las cuevas cercanas.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Morthal'
  },
  {
    name: 'Markarth',
    cuerpo: 'Construida enteramente sobre las ruinas de piedra de la colosal fortaleza enana de Nchuand-Zel, Markarth es la capital de La Cuenca y una de las ciudades más imponentes y verticales de Skyrim. Está gobernada por el jarl Igmund desde la majestuosa Fortaleza de Piedra Baja. Tras sus imponentes muros dorados de cantería y su lucrativa Mina de Cidhna, la ciudad sufre una sangrienta guerra encubierta entre los guardias locales, la influyente familia Sangre de Plata y los rebeldes nativos conocidos como los Renegados.',
    notas: '- Mantente alerta en el mercado, circulan rumores de que cualquiera a tu alrededor podría ser un espía de los Renegados esperando el momento justo para dar un golpe mortal.\n\n- Cuentan que nadie sale con vida de la Mina de Cidhna, pero los prisioneros veteranos susurran historias sobre un viejo líder que controla la cárcel desde las sombras más profundas de la roca.\n\n- Hay rumores de ruidos metálicos y vapores extraños saliendo de las zonas clausuradas de la fortaleza, el erudito de la corte parece estar buscando aventureros lo bastante temerarios para investigar las ruinas enanas selladas.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Markarth'
  },
  {
    name: 'Lucero del Alba',
    cuerpo: 'Antiguo campamento de la Compañía Minera de Roca Negra convertido en un austero puerto pesquero y minero, Lucero del Alba es la capital de la comarca de El Pálido. Está gobernada por el veterano jarl Escaldo el Sabio, un ferviente partidario de los Capas de la Tormenta que gobierna desde el Salón de la Cumbre Blanca. La ciudad basa su economía en sus dos ricas minas de hierro y azogue, aunque el frío glacial y el constante azote del Mar de los Fantasmas la convierten en uno de los lugares más inhóspitos para vivir en toda la provincia.',
    notas: '- Un insomnio colectivo azota a todos los habitantes con pesadillas recurrentes deberías de preguntar en la posada sobre este misterio.\n\n- Se dice que cerca a la ciudad se encuentra una puerta negra que te susurra, los rumores dicen que si le dices las palabras correctas la puerta se abrirá.\n\n- Si necesitas ingredientes alquímicos poco comunes del norte marino (como grasa de troll de las nieves o sales polares), revisa las costas rocosas y los barcos atracados al amanecer.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Lucero_del_Alba'
  },
  {
    name: 'Soledad',
    cuerpo: 'También conocida como Haafingar, Soledad es la capital imperial en Skyrim, caracterizada por tener uno de los puertos más importantes no solo de Skyrim sino de todo Tamriel. Además es el hogar del famoso Colegio de Bardos, un gremio de bardos y oradores liderado por Viarmo. Soledad es liderada por la jarl Elisif La Justa, y reside en el Palacio Azul, hogar de los reyes de Skyrim.',
    notas: '- Soledad es una ciudad imperial, por lo que cualquier afiliación o apoyo a los Capa de la Tormenta es severamente castigado, llegando a ser condenado con decapitación.\n\n- Cerca del Castillo Severo hay un patio de entrenamiento donde los guardias entrenan sus habilidades de arquería, normalmente dejan muchas flechas sin supervisión, por lo que puede ser una buena fuente de munición.\n\n- Soledad tiene muchas entradas públicas, sin embargo, cerca del puente del puerto hay una entrada secreta que lleva directamente a la ciudad y puede ser usada cuando necesitas tener el sigilo de tu lado.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Soledad'
  },
  {
    name: 'Ventalia',
    cuerpo: 'Considerada la ciudad humana más antigua que aún sigue en pie en todo Tamriel, Ventalia es la capital de la Marca Oriental y el bastión principal de la rebelión de los Capas de la Tormenta. Es gobernada por el jarl Ulfric Capa de la Tormenta desde el imponente Palacio de los Reyes, una de las pocas estructuras que sobrevivió al Gran Colapso del pasado nórdico. La ciudad está marcada por fuertes tensiones raciales y sociales, dividiendo a su población entre los nórdicos tradicionales y los elfos oscuros marginados en el Barrio Gris, además de los argonianos relegados al exterior de las murallas en la Ensambladura de Ventalia.',
    notas: '- Es posible adquirir la propiedad "Hjerim" por 12.000 septims a Jorleif, aunque tendrás que demostrar al jarl con tus acciones que eres de confianza.\n\n- El racismo y el nacionalismo nórdico son palpables en cada esquina; mostrar simpatía por el Imperio o el Dominio de Aldmer dentro de sus murallas te ganará el desprecio inmediato de la guardia y los ciudadanos.\n\n- Prepárate para ir abrigado ya que Ventalia siempre está cubierta de nieve al estar cerca de la parte más fría de todo Skyrim.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Ventalia'
  },
  {
    name: 'Hibernalia',
    cuerpo: 'Alguna vez una de las capitales más prósperas, ricas y poderosas de Skyrim, Hibernalia es hoy una sombra de su pasado tras el desastre mágico conocido como el Gran Colapso, evento que destruyó la mayor parte del asentamiento arrojándolo al Mar de los Fantasmas. Es liderada por el jarl Korir desde el Salón Comunal del Jarl, quien mantiene un profundo resentimiento y desconfianza hacia la única estructura que quedó intacta tras la catástrofe: el Colegio de Hibernalia.',
    notas: '- A diferencia de otras comarcas principales, Hibernalia no cuenta con una propiedad residencial para comprar; el único alojamiento permanente disponible se obtiene uniéndose al Colegio de Hibernalia en los aposentos para estudiantes.\n\n- El Colegio de Hibernalia es el centro definitivo para el aprendizaje arcano en la provincia, albergando al Archimago Savos Aren y a maestros entrenadores de todas las escuelas de magia.\n\n- Debido al clima ártico extremo y su aislamiento geográfico, los comerciantes escasean; la taberna "El hogar helado" y el almacén de Birna son prácticamente los únicos puntos de comercio de la aldea exterior.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Hibernalia'
  },
  {
    name: 'Carrera Blanca',
    cuerpo: 'Alguna vez considerada “La Ciudad Imperial de Skyrim”, Carrera Blanca es la capital de la Comarca de Carrera Blanca en la provincia de Skyrim. Es liderada por el jarl Balgruuf el Grande quien ha llevado a la ciudad a perder el prestigio que alguna vez tuvo, esto por culpa de La Guerra Civil entre los Capa de la Tormenta y el Imperio, los inviernos excesivamente duros y el acoso constante de bandidos. Carrera Blanca es hogar de dos importantes clanes: los Melena Gris y los Batallador.\nCarrera Blanca es también la sede de Los Compañeros situada en Jorrvaskr, un legendario salón de aguamiel.',
    notas: '- Es posible comprar una propiedad llamada “El hogar de la brisa” a Provencio Avenicci por 5000 septims.\n\n- Ten cuidado con tus ideologías políticas, Carrera Blanca es un territorio muy neutral pero con mucha tensión entre ambos bandos.\n\n- Si quieres tener las mejores armas y armaduras, no dudes en dirigirte a la Forja del Cielo donde Eorlund Melena Gris forja con el mejor acero de todo Skyrim.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Carrera_Blanca_(Skyrim)',
    rumors: [
      { text: 'Mientras caminabas a las afueras de Carrera Blanca escuchaste unos ruidos de lucha provenientes de una granja. Cuando te acercaste viste a un grupo de guerreros derribando a un gigante, ¡ayúdalos!', btnText: 'AYUDAR' },
      { text: 'El grupo de guerreros te elogia y te invita a formar parte de Los Compañeros. Dirígete a Jorrvaskr para hablar con Kodlak Melena Blanca, pero ten cuidado, se rumorea que de allí provienen aullidos extraños en las noches con luna.', btnText: 'UNIRSE', unlockLocation: { name: 'Túmulo del Hombre de Polvo', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerName: 'Tumulo Marcador' } }
    ]
  },
  {
    name: 'Túmulo del Hombre de Polvo',
    cuerpo: 'Antigua tumba nórdica situada al sureste de Morthal. Dentro de la tumba habitan criaturas peligrosas como los Draugr y las arañas. Hay quienes dicen haber escuchado voces humanas dentro.',
    notas: '- Se dice que allí yace uno de los fragmentos del hacha legendaria y ancestral de Los Compañeros.\n\n- La tumba está sellada. Tal vez un miembro de Los Compañeros tenga una llave para acceder.\n\n- La tumba parece estar relacionada con Ysgramor, el otrora mítico líder de Los Compañeros.',
    url: 'https://elderscrolls.fandom.com/es/wiki/T%C3%BAmulo_del_Hombre_de_Polvo',
    rumors: [
      { text: 'Aún no eres un miembro pleno de Los Compañeros. Fuiste enviado a este lugar para recuperar un fragmento de la legendaria hacha Wuuthrad, que perteneció a Ysgramor. Farkas te acompañará en esta misión como tu compañero de escudo.', btnText: 'ADENTRARSE' },
      { text: 'Haces un dueto perfecto con Farkas. Ningún enemigo, por peligroso que sea, ha podido atravesar sus defensas. Llegan a una habitación con una reja cerrada. Te acercas a una palanca. Crees que abrirá el camino, pero en su lugar te encierra y te separa de Farkas. Miembros de la Mano de Plata lo rodean y entonces lo ves: un hombre lobo real.', btnText: 'RECOGER FRAGMENTO DE WUUTHRAD' },
      { text: 'Tras el descubrimiento sobre Farkas y los compañeros, te adentras más en la tumba hasta que obtienes el fragmento de la legendaria Wuuthrad.', btnText: 'CONTINUAR', unlockLocation: { name: 'Aquelarre de Glenmoril', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerName: 'Glenmoril Marcador' } }
    ]
  },
  {
    name: 'Aquelarre de Glenmoril',
    cuerpo: 'Ubicada al oeste de Falkreath, el Aquelarre de Glenmoril refugia a las malvadas Brujas de Glenmoril, responsables de la terrible maldición (o bendición para otros) que acosa al Círculo de Los Compañeros.',
    notas: '- Prepárate bien. Las brujas usarán magia oscura y antigua con poderes devastadores.\n\n- Afila bien tus espadas y evita la magia, pues su brujería las vuelve especialmente resistentes a los ataques mágicos y de fuego.\n\n- Ten cuidado con el botín. No existen más que las cinco Brujas de Glenmoril. Utiliza bien sus cabezas.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Aquelarre_de_Glenmoril',
    rumors: [
      { text: 'Tras unirte al Círculo y contraer la licantropía, Kodlak Melena Blanca acude a ti en busca de ayuda. Te cuenta que ha descubierto cómo curar la licantropía, condición incompatible con Sovngarde. Todo se reduce al origen de la maldición. Debes encontrar a las Brujas de Glenmoril y tomar sus cabezas.', btnText: 'QUE EMPIECE LA CAZA DE BRUJAS' },
      { text: 'Lograste sobrevivir a la magia oscura de las brujas. Usaste tu propia maldición en su contra y las devoraste hasta que solo quedaron sus cabezas. Es momento de que vuelvas a Jorrvaskr.', btnText: 'CONTINUAR', unlockLocation: { name: 'Tumba de Ysgramor', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerName: 'Ysgramor Marcador' } }
    ]
  },
  {
    name: 'Tumba de Ysgramor',
    cuerpo: 'Localizada en una isla helada al noroeste de Hibernalia, yacen los restos humanos del mítico y legendario líder de Los Compañeros Ysgramor. Su entrada está bloqueada para la gente corriente.',
    notas: '- Se dice que la estatua de Ysgramor en la entrada protege el acceso y solo permitirá pasar a aquellos que le devuelvan lo que le hace falta.\n\n- No olvides llevar la Wuuthrad, podría ser de gran utilidad en la tumba de su antiguo dueño.\n\n- Se dice que en las profundidades de la tumba yacen Ysgramor y sus más acérrimos aliados. Prepárate para luchar contra seres legendarios.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Tumba_de_Ysgramor',
    rumors: [
      { text: 'Regresaste con las cabezas, pero Kodlak había sido asesinado por la Mano de Plata. En un ataque directo y vengativo, acabas con esta facción cazadora de licántropos y te haces con el último fragmento de la Wuuthrad. Es momento de cumplir la última voluntad de Kodlak y que cures a su espíritu de la maldición del Círculo. Tu última parada es el lugar de descanso del antiguo líder de Los Compañeros, Ysgramor.', btnText: '¡POR KODLAK!' },
      { text: 'Conseguiste llegar a las profundidades de la tumba y te encuentras en el gran salón funerario. Invocas al espíritu de Kodlak Melena Blanca, quien te pide que lo cures. Usas una cabeza de Bruja de Glenmoril y la quemas en un pedestal llameante. Verás manifestarse un espíritu con la forma de un lobo, acaba con él y permite que Kodlak descanse en Sovngarde.', btnText: 'TERMINAR' }
    ]
  },
  {
    name: 'Falkreath',
    cuerpo: 'Famosa en todo el continente por albergar el cementerio más grande y antiguo de Skyrim, Falkreath es la capital de la comarca homónima, enclavada en los densos y frondosos bosques de pinos del sur. Es liderada por el joven y arrogante jarl Siddgeir, quien prefiere el lujo y los acuerdos turbios con bandidos locales antes que la administración de su pueblo. Sus habitantes viven en estrecha cercanía con la muerte y el luto, reflejándolo en sus nombres de negocios y en el respeto solemne hacia sus caídos.',
    notas: '- Los guardias comentan en voz baja que hay un prisionero en las celdas con una fuerza sobrehumana, encerrado tras un brutal suceso relacionado con una bestia salvaje en los bosques.\n\n- El herrero del pueblo y varios guardias aseguran haber visto un perro inusualmente inteligente rondando los caminos exteriores, y muchos creen que seguir a ese animal lleva a un destino misterioso.\n\n- Corren leyendas entre los leñadores sobre un cementerio olvidado en la espesura donde los cazadores desaparecen sin dejar rastro si se atreven a perturbar la fauna sagrada del bosque.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Falkreath',
    rumors: [
      { text: 'Al entrar a Falkreath escuchas recitar unos ritos funerarios. Al acercarte, ves a una afligida pareja llorando frente a una tumba. Preguntas qué pasó y te hablan del asesinato de su pequeña hija, Lavinia a manos de Sinding que está encerrado en los cuarteles.\n\nDecides ir a la celda a escuchar a Sinding. Cuando hablas con él sobre el ataque, te menciona un anillo maldito que lo obligó a cometer el crimen. Sinding te entrega el anillo y te pide que lo ayudes a eliminar la maldición, pero ten cuidado, ¡el anillo está maldito y podrías transformarte en una bestia en cualquier momento!\n\nAl salir de los cuarteles ves un ciervo blanco. Un instinto te pide que lo caces. Cuando lo mates, el espíritu de Hircine se manifestará y te pedirá que cumplas una cacería por él.', btnText: 'QUE INICIE LA CAZA', unlockLocation: { name: 'Gruta del Hombre Hinchado', image: 'assets/Iconos/Ubicaciones/Cueva.png', markerName: 'Hinchado Marcador' } }
    ]
  },
  {
    name: 'Gruta del Hombre Hinchado',
    cuerpo: 'Localizada al norte de la orilla del Lago Ilinalta se encuentra una cueva rodeada de pequeños acantilados. En su interior yace un santuario dedicado a Talos.',
    notas: '- Presenta tus respetos frente al altar de Talos. Tal vez su bendición te sea útil para el recorrido.\n\n- Es posible encontrar una espada a los pies del altar de Talos. Perteneció a Acilius Bolar, un cuchilla que murió a manos de los Thalmor.\n\n- Aullidos y gritos de horror se escuchan ocasionalmente al interior de la gruta. Será mejor que te andes con cuidado.',
    url: 'https://elderscrolls.fandom.com/es/wiki/Gruta_del_Hombre_Hinchado',
    rumors: [
      { text: 'Al llegar a la gruta, un aullido y un grito de auxilio te hace estremecer. Al interior de la gruta te espera una cacería de vida o muerte. Te verás cara a cara contra la bestia asesina de Lavinia.', btnText: 'ADENTRARSE' },
      { text: 'La decisión está en tus manos, Sangre de Dragón, ¿eliminaste a la bestia o la ayudaste a eliminar a los cazadores que la atacaban? Sea como sea, Hircine está satisfecho y una grata recompensa te espera…Que la bendición de Hircine guíe tus garras y que tu presa nunca escape de tu vista.', btnText: 'TERMINAR' }
    ]
  }
]

fs.writeFileSync('cities_data.json', JSON.stringify(cities, null, 2))
console.log('Cities data written successfully')
