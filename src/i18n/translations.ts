export type Language = 'en' | 'es' | 'fr' | 'pt' | 'zh';

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
    badge1: string;
    badge2: string;
    badge3: string;
    badge4: string;
  };
  nav: {
    brand: string;
    steps: string;
    canvas: string;
    rules: string;
    quiz: string;
    faq: string;
    startBtn: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  input: {
    title: string;
    smartTab: string;
    generalTab: string;
    standardTab: string;
    functionTab: string;
    smartPlaceholder: string;
    smartHelp: string;
    solveBtn: string;
    resetBtn: string;
    orientationLabel: string;
    horizOpt: string;
    vertOpt: string;
    currentEq: string;
    coeffA: string;
    coeffB: string;
    coeffC: string;
    coeffD: string;
    coeffStd: string;
    presetsTitle: string;
    errorTitle: string;
  };
  summary: {
    title: string;
    copyBtn: string;
    copied: string;
    printBtn: string;
    vertex: string;
    focus: string;
    directrix: string;
    axisOfSym: string;
    direction: string;
    pParam: string;
    halfPParam: string;
    latusRectum: string;
    latusEndpoints: string;
    domain: string;
    range: string;
    standardEq: string;
    eccentricity: string;
  };
  steps: {
    title: string;
    subtitle: string;
    collapseAll: string;
    expandAll: string;
    coreBadge: string;
  };
  canvas: {
    title: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    toggleProof: string;
    toggleLatus: string;
    dragPointNotice: string;
    definitionProofTitle: string;
    curveLabel: string;
    focusLabel: string;
    directrixLabel: string;
    latusLabel: string;
  };
  guide: {
    title: string;
    subtitle: string;
    tabTable: string;
    tabMnemonics: string;
    tabPitfalls: string;
    tblEq: string;
    tblDir: string;
    tblFocus: string;
    tblDirectrix: string;
    tblAxis: string;
    tblNote: string;
    right: string;
    left: string;
    up: string;
    down: string;
    rule1Title: string;
    rule1Text: string;
    rule2Title: string;
    rule2Text: string;
    rule3Title: string;
    rule3Text: string;
    pitfall1Title: string;
    pitfall1Text: string;
    pitfall2Title: string;
    pitfall2Text: string;
    pitfall3Title: string;
    pitfall3Text: string;
    pitfall4Title: string;
    pitfall4Text: string;
  };
  quiz: {
    title: string;
    progress: string;
    score: string;
    eqPrompt: string;
    restartBtn: string;
    nextBtn: string;
    completed: string;
    correct: string;
    wrong: string;
  };
  faq: {
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
  };
  footer: {
    desc: string;
    rights: string;
  };
  keywords: {
    title: string;
    tags: string[];
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  // DEFAULT ENGLISH
  en: {
    meta: {
      title: 'Parabola Focus & Directrix Calculator | Completing the Square Steps',
      description: 'Online parabola focus and directrix calculator with full completing the square steps, orientation rules, interactive graph, and formula cheat sheet.',
      badge1: 'Analytic Geometry',
      badge2: 'Completing the Square',
      badge3: 'LaTeX Formula Rendering',
      badge4: 'Direction Rules & Traps'
    },
    nav: {
      brand: 'Parabola Solver',
      steps: 'Step-by-Step Solution',
      canvas: 'Interactive Graph',
      rules: 'Direction Mnemonics',
      quiz: 'Practice Quiz',
      faq: 'FAQ & Concepts',
      startBtn: 'Solve Equation'
    },
    hero: {
      title: 'Parabola Focus & Directrix Calculator',
      subtitle: 'Master conic sections with detailed completing-the-square steps, direction mnemonics, and real-time interactive geometric proof.'
    },
    input: {
      title: 'Enter Parabola Equation',
      smartTab: 'Smart Input (Auto-Detect)',
      generalTab: 'General Form & Complete Square',
      standardTab: 'Standard Form (Vertex at 0,0)',
      functionTab: 'Quadratic Function Form',
      smartPlaceholder: 'e.g. y^2 - 4y - 8x + 12 = 0  or  y^2 = 8x  or  y = 0.25x^2',
      smartHelp: 'Type or paste any quadratic equation; auto-parsed in real time.',
      solveBtn: 'Solve Step-by-Step',
      resetBtn: 'Reset',
      orientationLabel: 'Axis Orientation:',
      horizOpt: 'y is squared (Horizontal axis, opens Left/Right)',
      vertOpt: 'x is squared (Vertical axis, opens Up/Down)',
      currentEq: 'Equation to solve:',
      coeffA: 'Coeff A (Squared)',
      coeffB: 'Coeff B (Linear)',
      coeffC: 'Opposite Linear Coeff C',
      coeffD: 'Constant D',
      coeffStd: 'Linear coefficient k (where 2p = |k|)',
      presetsTitle: 'High-Frequency Exam Problems (Click to solve):',
      errorTitle: 'Input Error:'
    },
    summary: {
      title: 'Key Results Summary',
      copyBtn: 'Copy Solution',
      copied: 'Copied!',
      printBtn: 'Print / Save PDF',
      vertex: 'Vertex V',
      focus: 'Focus F',
      directrix: 'Directrix Line',
      axisOfSym: 'Axis of Symmetry',
      direction: 'Opening Direction',
      pParam: 'Focal Parameter p',
      halfPParam: 'Distance to Vertex (p/2)',
      latusRectum: 'Latus Rectum (2p)',
      latusEndpoints: 'Latus Rectum Ends',
      domain: 'Domain',
      range: 'Range',
      standardEq: 'Standard Vertex Form',
      eccentricity: 'Eccentricity'
    },
    steps: {
      title: 'Detailed Step-by-Step Breakdown',
      subtitle: 'Complete breakdown of completing the square, isolating parameters, and computing coordinates.',
      collapseAll: 'Collapse Steps',
      expandAll: 'Expand All Steps',
      coreBadge: 'Core Exam Point'
    },
    canvas: {
      title: 'Interactive Geometric Coordinate Board',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
      toggleProof: 'Proof Point P: ',
      toggleLatus: 'Latus Rectum: ',
      dragPointNotice: 'Move Point P along curve:',
      definitionProofTitle: 'Geometric Definition Proof: |PF| = d(P, Directrix)',
      curveLabel: 'Parabola Curve',
      focusLabel: 'Focus F',
      directrixLabel: 'Directrix l',
      latusLabel: 'Latus Rectum (2p)'
    },
    guide: {
      title: 'Parabola Orientation Guide & Avoid Common Mistakes',
      subtitle: 'Never confuse opening directions or mix up p and p/2.',
      tabTable: '4 Standard Forms Table',
      tabMnemonics: 'Quick Direction Rules',
      tabPitfalls: '4 Common Exam Traps',
      tblEq: 'Standard Equation',
      tblDir: 'Opening Direction',
      tblFocus: 'Focus F',
      tblDirectrix: 'Directrix Equation',
      tblAxis: 'Axis of Symmetry',
      tblNote: 'Note: In standard form, p > 0. The sign of the linear term determines the direction.',
      right: 'Opens Right (→)',
      left: 'Opens Left (←)',
      up: 'Opens Up (↑)',
      down: 'Opens Down (↓)',
      rule1Title: 'Rule 1: Linear Variable Sets the Axis, Sign Sets the Direction',
      rule1Text: 'Look at the linear (degree 1) term. If it contains x, the axis is parallel to the x-axis (opens left/right). If positive, opens right; if negative, opens left.',
      rule2Title: 'Rule 2: Focus Inside the Curve, Directrix Behind the Vertex',
      rule2Text: 'The parabola embraces the focus in its interior. The directrix line sits behind the vertex on the outside.',
      rule3Title: 'Rule 3: Both Are Separated by Half-Step (p/2)',
      rule3Text: 'Vertex to Focus is p/2. Vertex to Directrix is also p/2. The total distance between Focus and Directrix is p.',
      pitfall1Title: 'Trap 1: Confusing Quadratic Function y = ax² with Standard Form',
      pitfall1Text: 'In y = 2x², 2 is NOT 2p! You must normalize: x² = (1/2)y, so 2p = 1/2 ⇒ p = 1/4 ⇒ Focus is (0, 1/8).',
      pitfall2Title: 'Trap 2: Writing p Instead of p/2 for Focus Coordinate',
      pitfall2Text: 'From 2p = 8, p = 4. The distance from vertex to focus is p/2 = 2, NOT 4! Many students lose points here.',
      pitfall3Title: 'Trap 3: Writing Only a Number for Directrix Instead of an Equation',
      pitfall3Text: 'The directrix is a straight line! Write "x = -2" or "y = 1", never just "-2".',
      pitfall4Title: 'Trap 4: Forgetting to Multiply Outside Constant When Completing Square',
      pitfall4Text: 'When factoring 2(y² - 4y + 4), you must add 2 × 4 = 8 to the other side, not 4.'
    },
    quiz: {
      title: 'Quick Direction & Focus Rapid Quiz',
      progress: 'Question',
      score: 'Score:',
      eqPrompt: 'Given Equation:',
      restartBtn: 'Restart Quiz',
      nextBtn: 'Next Question',
      completed: 'Quiz Completed! Final Score:',
      correct: 'Correct!',
      wrong: 'Incorrect. See explanation below:'
    },
    faq: {
      title: 'Frequently Asked Questions & Essential Concepts',
      q1: 'What is the geometric definition of a parabola?',
      a1: 'A parabola is the set of all points in a plane that are equidistant from a fixed point called the Focus and a fixed line called the Directrix: |PF| = d(P, Directrix).',
      q2: 'How do you find the focus and directrix by completing the square?',
      a2: '1. Group the squared variable terms on the left. 2. Move linear terms to the right. 3. Add (b/2)² to both sides. 4. Factor the left into a perfect square. 5. Factor out the linear coefficient on the right to match (y - k)² = 2p(x - h). 6. Extract vertex (h, k) and p.',
      q3: 'Why is the focal length p/2 and not p?',
      a3: 'The parameter 2p is the length of the focal chord (latus rectum). The total distance from the focus to the directrix line is p. Because the vertex is halfway between the focus and the directrix, the distance from vertex to focus is exactly p/2.',
      q4: 'How can you instantly tell which way a parabola opens?',
      a4: 'Identify the variable with exponent 1 (the linear variable). That variable gives the axis of symmetry. The sign of its coefficient gives the direction: positive goes towards positive axis, negative goes towards negative axis.'
    },
    footer: {
      desc: 'Parabola Focus & Directrix Online Solver · Interactive Conic Sections Learning Platform',
      rights: 'All calculation steps formatted with LaTeX. Free for students and educators.'
    },
    keywords: {
      title: 'High-Yield Topics & Popular Searches:',
      tags: [
        'Parabola focus and directrix calculator',
        'Completing the square parabola steps',
        'How to find directrix of a parabola',
        'Latus rectum formula 2p',
        'Parabola opening direction rules',
        'Vertex form (x-h)² = 4p(y-k)',
        'Focal radius formula'
      ]
    }
  },

  // SPANISH (Español)
  es: {
    meta: {
      title: 'Calculadora de Foco y Directriz de la Parábola | Paso a Paso',
      description: 'Calculadora de foco y directriz de parábolas con método de completar el cuadrado detallado, reglas de orientación, gráfico interactivo y fórmulas.',
      badge1: 'Geometría Analítica',
      badge2: 'Completar el Cuadrado',
      badge3: 'Fórmulas en LaTeX',
      badge4: 'Reglas de Orientación'
    },
    nav: {
      brand: 'Calculadora de Parábolas',
      steps: 'Pasos de Resolución',
      canvas: 'Gráfico Interactivo',
      rules: 'Reglas de Orientación',
      quiz: 'Práctica Rápida',
      faq: 'Preguntas Frecuentes',
      startBtn: 'Resolver Ecuación'
    },
    hero: {
      title: 'Calculadora de Foco y Directriz de la Parábola',
      subtitle: 'Aprende cónicas con el desarrollo completo del método de completar el cuadrado, reglas nemotécnicas para no invertir la orientación y comprobación geométrica en tiempo real.'
    },
    input: {
      title: 'Ingresar Ecuación de la Parábola',
      smartTab: 'Entrada Inteligente (Auto-Detección)',
      generalTab: 'Forma General y Completar Cuadrados',
      standardTab: 'Forma Canónica (Vértice en 0,0)',
      functionTab: 'Función Cuadrática',
      smartPlaceholder: 'ej. y^2 - 4y - 8x + 12 = 0  o  y^2 = 8x  o  y = 0.25x^2',
      smartHelp: 'Escribe o pega cualquier ecuación cuadrática; se analiza en tiempo real.',
      solveBtn: 'Resolver Paso a Paso',
      resetBtn: 'Reiniciar',
      orientationLabel: 'Orientación del Eje:',
      horizOpt: 'y al cuadrado (Eje horizontal, abre Izq / Der)',
      vertOpt: 'x al cuadrado (Eje vertical, abre Arriba / Abajo)',
      currentEq: 'Ecuación a resolver:',
      coeffA: 'Coeficiente A (Cuadrático)',
      coeffB: 'Coeficiente B (Lineal mismo eje)',
      coeffC: 'Coeficiente C (Lineal opuesto)',
      coeffD: 'Término Constante D',
      coeffStd: 'Coeficiente lineal k (donde 2p = |k|)',
      presetsTitle: 'Ejercicios de Examen Frecuentes (Clic para resolver):',
      errorTitle: 'Error de Entrada:'
    },
    summary: {
      title: 'Resumen de Resultados Principales',
      copyBtn: 'Copiar Solución',
      copied: '¡Copiado!',
      printBtn: 'Imprimir / Guardar PDF',
      vertex: 'Vértice V',
      focus: 'Foco F',
      directrix: 'Directriz',
      axisOfSym: 'Eje de Simetría',
      direction: 'Orientación',
      pParam: 'Parámetro Focal p',
      halfPParam: 'Distancia al Vértice (p/2)',
      latusRectum: 'Lado Recto (2p)',
      latusEndpoints: 'Extremos del Lado Recto',
      domain: 'Dominio',
      range: 'Rango',
      standardEq: 'Ecuación Canónica',
      eccentricity: 'Excentricidad'
    },
    steps: {
      title: 'Desarrollo Detallado Paso a Paso',
      subtitle: 'Completar el cuadrado, despeje algebraico y cálculo de coordenadas.',
      collapseAll: 'Contraer Pasos',
      expandAll: 'Desplegar Todos los Pasos',
      coreBadge: 'Punto Clave de Examen'
    },
    canvas: {
      title: 'Pizarra Geométrica Interactiva',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      resetView: 'Restablecer',
      toggleProof: 'Punto de Prueba P: ',
      toggleLatus: 'Lado Recto: ',
      dragPointNotice: 'Desliza el punto P sobre la curva:',
      definitionProofTitle: 'Demostración de Definición: |PF| = d(P, Directriz)',
      curveLabel: 'Curva Parábola',
      focusLabel: 'Foco F',
      directrixLabel: 'Directriz l',
      latusLabel: 'Lado Recto (2p)'
    },
    guide: {
      title: 'Guía de Orientación y Errores Típicos en Exámenes',
      subtitle: 'Aprende a no confundir hacia dónde abre la parábola ni intercambiar p con p/2.',
      tabTable: 'Tabla de las 4 Formas Canónicas',
      tabMnemonics: 'Reglas Nemotécnicas',
      tabPitfalls: '4 Errores Frecuentes',
      tblEq: 'Ecuación Canónica',
      tblDir: 'Hacia Dónde Abre',
      tblFocus: 'Coordenadas del Foco F',
      tblDirectrix: 'Ecuación de la Directriz',
      tblAxis: 'Eje Focal',
      tblNote: 'Nota: En la forma canónica, p > 0. El signo del término lineal define la dirección.',
      right: 'Abre hacia la Derecha (→)',
      left: 'Abre hacia la Izquierda (←)',
      up: 'Abre hacia Arriba (↑)',
      down: 'Abre hacia Abajo (↓)',
      rule1Title: 'Regla 1: El término lineal manda el eje y el signo manda la dirección',
      rule1Text: 'Mira el término de grado 1. Si es x, el eje es paralelo al eje x (horizontal). Si es positivo, abre a la derecha; si es negativo, a la izquierda.',
      rule2Title: 'Regla 2: El foco está dentro y la directriz está detrás del vértice',
      rule2Text: 'La parábola siempre abraza al foco en su interior. La recta directriz siempre queda a espaldas del vértice.',
      rule3Title: 'Regla 3: Ambos están a una distancia de medio paso (p/2)',
      rule3Text: 'Del vértice al foco hay p/2. Del vértice a la directriz hay p/2. Entre foco y directriz hay una distancia completa de p.',
      pitfall1Title: 'Error 1: Confundir la función y = ax² con la forma canónica',
      pitfall1Text: 'En y = 2x², ¡el 2 NO es 2p! Primero normaliza: x² = (1/2)y, por lo que 2p = 1/2 ⇒ p = 1/4 ⇒ el foco es (0, 1/8).',
      pitfall2Title: 'Error 2: Usar p en vez de p/2 para las coordenadas del foco',
      pitfall2Text: 'Si 2p = 8, entonces p = 4. Pero la distancia desde el vértice es p/2 = 2. Muchos estudiantes ponen erróneamente (4, 0).',
      pitfall3Title: 'Error 3: Escribir solo un número para la directriz en lugar de una ecuación',
      pitfall3Text: '¡La directriz es una línea recta! Debe escribirse "x = -2" o "y = 1", nunca únicamente "-2".',
      pitfall4Title: 'Error 4: Olvidar multiplicar el factor común al completar el cuadrado',
      pitfall4Text: 'Al factorizar 2(y² - 4y + 4), al otro lado de la igualdad se debe sumar 2 × 4 = 8, no solo 4.'
    },
    quiz: {
      title: 'Test Rápido de Orientación y Foco',
      progress: 'Pregunta',
      score: 'Puntuación:',
      eqPrompt: 'Ecuación dada:',
      restartBtn: 'Reiniciar Test',
      nextBtn: 'Siguiente Pregunta',
      completed: '¡Test finalizado! Puntuación final:',
      correct: '¡Correcto!',
      wrong: 'Incorrecto. Mira la explicación:'
    },
    faq: {
      title: 'Preguntas Frecuentes y Conceptos Clave',
      q1: '¿Cuál es la definición geométrica de la parábola?',
      a1: 'Es el lugar geométrico de los puntos del plano que equidistan de un punto fijo llamado Foco y de una recta fija llamada Directriz: |PF| = d(P, Directriz).',
      q2: '¿Cómo se completa el cuadrado en una parábola?',
      a2: '1. Agrupa los términos de la variable cuadrática a la izquierda. 2. Pasa los términos lineales a la derecha. 3. Suma (b/2)² en ambos miembros. 4. Factoriza el trinomio cuadrado perfecto. 5. Saca factor común del término lineal a la derecha para obtener la forma (y-k)² = 2p(x-h).',
      q3: '¿Por qué la distancia al foco es p/2 y no p?',
      a3: 'El parámetro p es la distancia total entre el foco y la directriz. Como el vértice es el punto medio entre el foco y la directriz, la distancia desde el vértice a cualquiera de ellos es exactamente p/2.',
      q4: '¿Cómo saber de inmediato hacia dónde abre la parábola?',
      a4: 'Identifica la variable que no está elevada al cuadrado (término lineal). Esa variable indica el eje de simetría. El signo del coeficiente indica el sentido (positivo hacia los positivos, negativo hacia los negativos).'
    },
    footer: {
      desc: 'Calculadora de Foco y Directriz de la Parábola · Plataforma Educativa de Geometría Analítica',
      rights: 'Fórmulas formateadas en LaTeX. Gratuito para estudiantes y profesores.'
    },
    keywords: {
      title: 'Temas Clave y Búsquedas Populares:',
      tags: [
        'Calculadora de foco y directriz parábola',
        'Completar el cuadrado parábola paso a paso',
        'Cómo encontrar la directriz de una parábola',
        'Fórmula del lado recto 2p',
        'Hacia dónde abre la parábola',
        'Ecuación canónica de la parábola',
        'Radio focal de la parábola'
      ]
    }
  },

  // FRENCH (Français)
  fr: {
    meta: {
      title: 'Calculateur Foyer et Directrice de Parabole | Étapes Détaillées',
      description: 'Calculateur en ligne du foyer et de la directrice d\'une parabole avec méthode de complétion du carré, règles d\'orientation et graphe interactif.',
      badge1: 'Géométrie Analytique',
      badge2: 'Complétion du Carré',
      badge3: 'Rendu LaTeX',
      badge4: 'Orientation & Pièges'
    },
    nav: {
      brand: 'Solveur de Paraboles',
      steps: 'Résolution Pas à Pas',
      canvas: 'Graphique Interactif',
      rules: 'Règles d\'Orientation',
      quiz: 'Quiz d\'Entraînement',
      faq: 'FAQ & Notions',
      startBtn: 'Résoudre l\'Équation'
    },
    hero: {
      title: 'Calculateur Foyer et Directrice de la Parabole',
      subtitle: 'Maîtrisez les coniques grâce aux étapes complètes de la méthode de complétion du carré, aux astuces pour ne jamais inverser le sens d\'ouverture et à la démonstration géométrique.'
    },
    input: {
      title: 'Entrer l\'Équation de la Parabole',
      smartTab: 'Saisie Intelligente (Détection Auto)',
      generalTab: 'Forme Générale & Complétion du Carré',
      standardTab: 'Forme Canonique (Sommet à l\'Origine)',
      functionTab: 'Fonction Quadratique',
      smartPlaceholder: 'ex: y^2 - 4y - 8x + 12 = 0  ou  y^2 = 8x  ou  y = 0.25x^2',
      smartHelp: 'Saisissez ou collez n\'importe quelle équation; détection en direct.',
      solveBtn: 'Résoudre Pas à Pas',
      resetBtn: 'Réinitialiser',
      orientationLabel: 'Orientation de l\'Axe :',
      horizOpt: 'y au carré (Axe horizontal, ouverture Gauche / Droite)',
      vertOpt: 'x au carré (Axe vertical, ouverture Haut / Bas)',
      currentEq: 'Équation à résoudre :',
      coeffA: 'Coefficient A (Quadratique)',
      coeffB: 'Coefficient B (Linéaire même axe)',
      coeffC: 'Coefficient C (Linéaire axe opposé)',
      coeffD: 'Constante D',
      coeffStd: 'Coefficient linéaire k (où 2p = |k|)',
      presetsTitle: 'Exercices Classiques d\'Examen (Cliquer pour résoudre) :',
      errorTitle: 'Erreur de saisie :'
    },
    summary: {
      title: 'Résumé des Résultats Clés',
      copyBtn: 'Copier la Solution',
      copied: 'Copié !',
      printBtn: 'Imprimer / Sauvegarder PDF',
      vertex: 'Sommet V',
      focus: 'Foyer F',
      directrix: 'Directrice',
      axisOfSym: 'Axe de Symétrie',
      direction: 'Sens d\'Ouverture',
      pParam: 'Paramètre Focal p',
      halfPParam: 'Distance au Sommet (p/2)',
      latusRectum: 'Corde Focale (2p)',
      latusEndpoints: 'Extrémités de la Corde Focale',
      domain: 'Domaine de Définition',
      range: 'Ensemble Image',
      standardEq: 'Forme Canonique',
      eccentricity: 'Excentricité'
    },
    steps: {
      title: 'Détail Pas à Pas de la Résolution',
      subtitle: 'Complétion du carré, factorisation et calcul des coordonnées.',
      collapseAll: 'Réduire les Étapes',
      expandAll: 'Déplier Toutes les Étapes',
      coreBadge: 'Point Fondamental'
    },
    canvas: {
      title: 'Tableau Géométrique Interactif',
      zoomIn: 'Zoomer',
      zoomOut: 'Dézoomer',
      resetView: 'Réinitialiser',
      toggleProof: 'Point Témoin P : ',
      toggleLatus: 'Corde Focale : ',
      dragPointNotice: 'Déplacez le point P sur la courbe :',
      definitionProofTitle: 'Preuve par Définition : |PF| = d(P, Directrice)',
      curveLabel: 'Courbe Parabole',
      focusLabel: 'Foyer F',
      directrixLabel: 'Directrice l',
      latusLabel: 'Corde Focale (2p)'
    },
    guide: {
      title: 'Guide d\'Orientation & Erreurs Fréquentes aux Examens',
      subtitle: 'Ne plus jamais inverser le sens d\'ouverture ni confondre p et p/2.',
      tabTable: 'Tableau des 4 Formes Canoniques',
      tabMnemonics: 'Moyens Mnémotechniques',
      tabPitfalls: '4 Pièges d\'Examen',
      tblEq: 'Équation Canonique',
      tblDir: 'Sens d\'Ouverture',
      tblFocus: 'Coordonnées du Foyer F',
      tblDirectrix: 'Équation de la Directrice',
      tblAxis: 'Axe Focal',
      tblNote: 'Remarque : Dans la forme canonique, p > 0. Le signe du terme linéaire fixe le sens.',
      right: 'Ouverte vers la Droite (→)',
      left: 'Ouverte vers la Gauche (←)',
      up: 'Ouverte vers le Haut (↑)',
      down: 'Ouverte vers le Bas (↓)',
      rule1Title: 'Règle 1 : Le terme linéaire donne l\'axe, le signe donne le sens',
      rule1Text: 'Regardez le terme de degré 1. S\'il contient x, l\'axe est parallèle à l\'axe des x (horizontal). S\'il est positif, elle s\'ouvre vers la droite ; sinon vers la gauche.',
      rule2Title: 'Règle 2 : Le foyer est à l\'intérieur, la directrice est derrière le sommet',
      rule2Text: 'La parabole enserre toujours le foyer dans son creux. La droite directrice est située à l\'arrière du sommet.',
      rule3Title: 'Règle 3 : Distance d\'un demi-pas (p/2) de chaque côté',
      rule3Text: 'Du sommet au foyer, il y a p/2. Du sommet à la directrice, il y a aussi p/2. L\'écart total entre foyer et directrice est de p.',
      pitfall1Title: 'Piège 1 : Confondre la fonction y = ax² avec la forme canonique',
      pitfall1Text: 'Dans y = 2x², 2 N\'EST PAS 2p ! Il faut normaliser : x² = (1/2)y, donc 2p = 1/2 ⇒ p = 1/4 ⇒ le foyer est (0, 1/8).',
      pitfall2Title: 'Piège 2 : Écrire p au lieu de p/2 pour les coordonnées du foyer',
      pitfall2Text: 'Si 2p = 8, alors p = 4. Mais la distance depuis le sommet est p/2 = 2. Ne confondez pas p et p/2 !',
      pitfall3Title: 'Piège 3 : Oublier la variable dans l\'équation de la directrice',
      pitfall3Text: 'La directrice est une droite ! Écrivez obligatoirement "x = -2" ou "y = 1", jamais un simple chiffre "-2".',
      pitfall4Title: 'Piège 4 : Oublier de multiplier le terme ajouté lors de la factorisation',
      pitfall4Text: 'En factorisant 2(y² - 4y + 4), on doit ajouter 2 × 4 = 8 de l\'autre côté de l\'équation, et non pas 4.'
    },
    quiz: {
      title: 'Quiz Rapide : Orientation & Foyer',
      progress: 'Question',
      score: 'Score :',
      eqPrompt: 'Équation proposée :',
      restartBtn: 'Recommencer le Quiz',
      nextBtn: 'Question Suivante',
      completed: 'Quiz terminé ! Score final :',
      correct: 'Exact !',
      wrong: 'Incorrect. Voici l\'explication :'
    },
    faq: {
      title: 'Foire Aux Questions & Définitions Mathématiques',
      q1: 'Quelle est la définition géométrique de la parabole ?',
      a1: 'Une parabole est l\'ensemble des points du plan situés à égale distance d\'un point fixe appelé Foyer et d\'une droite fixe appelée Directrice : |PF| = d(P, Directrice).',
      q2: 'Comment déterminer le foyer et la directrice en complétant le carré ?',
      a2: '1. Isolez les termes de la variable au carré à gauche. 2. Envoyez les termes linéaires à droite. 3. Ajoutez (b/2)² aux deux membres. 4. Factorisez le carré parfait. 5. Mettez en facteur le coefficient linéaire pour obtenir (y - k)² = 2p(x - h).',
      q3: 'Pourquoi la distance sommet-foyer est-elle p/2 et non p ?',
      a3: 'Le paramètre p représente la distance totale entre le foyer et la directrice. Le sommet se trouvant exactement à mi-chemin, sa distance au foyer est de p/2.',
      q4: 'Comment repérer immédiatement le sens d\'ouverture ?',
      a4: 'Repérez la variable de degré 1 (terme linéaire). Elle indique l\'axe de symétrie. Le signe de son coefficient indique la direction (positif vers les abscisses/ordonnées positives, négatif vers les négatives).'
    },
    footer: {
      desc: 'Calculateur Foyer et Directrice de Parabole · Plateforme de Géométrie Analytique',
      rights: 'Toutes les étapes sont mises en forme en LaTeX. Outil pédagogique libre.'
    },
    keywords: {
      title: 'Recherches Fréquentes & Notions Clés :',
      tags: [
        'Calculateur foyer directrice parabole',
        'Complétion du carré parabole étapes',
        'Comment trouver la directrice d\'une parabole',
        'Formule latus rectum corde focale 2p',
        'Sens d\'ouverture parabole gauche droite',
        'Forme canonique de la parabole',
        'Rayon focal parabole'
      ]
    }
  },

  // PORTUGUESE (Português)
  pt: {
    meta: {
      title: 'Calculadora de Foco e Diretriz da Parábola | Passo a Passo',
      description: 'Calculadora de foco e reta diretriz da parábola com método de completar quadrados passo a passo, regras de abertura e gráfico interativo.',
      badge1: 'Geometria Analítica',
      badge2: 'Completar Quadrados',
      badge3: 'Fórmulas em LaTeX',
      badge4: 'Regras de Orientação'
    },
    nav: {
      brand: 'Resolvedor de Parábolas',
      steps: 'Passo a Passo',
      canvas: 'Gráfico Interativo',
      rules: 'Regras de Abertura',
      quiz: 'Simulado Rápido',
      faq: 'Dúvidas & Conceitos',
      startBtn: 'Resolver Equação'
    },
    hero: {
      title: 'Calculadora de Foco e Diretriz da Parábola',
      subtitle: 'Domine cônicas com a demonstração completa de completar quadrados, macetes para não errar a concavidade e validação geométrica interativa em tempo real.'
    },
    input: {
      title: 'Inserir Equação da Parábola',
      smartTab: 'Entrada Inteligente (Detecção Automática)',
      generalTab: 'Forma Geral e Completar Quadrados',
      standardTab: 'Forma Padrão (Vértice na Origem)',
      functionTab: 'Função Quadrática',
      smartPlaceholder: 'ex: y^2 - 4y - 8x + 12 = 0  ou  y^2 = 8x  ou  y = 0.25x^2',
      smartHelp: 'Digite ou cole qualquer equação; identificação em tempo real.',
      solveBtn: 'Resolver Passo a Passo',
      resetBtn: 'Redefinir',
      orientationLabel: 'Orientação do Eixo:',
      horizOpt: 'y ao quadrado (Eixo horizontal, abre Esquerda / Direita)',
      vertOpt: 'x ao quadrado (Eixo vertical, abre Cima / Baixo)',
      currentEq: 'Equação a ser resolvida:',
      coeffA: 'Coeficiente A (Quadrático)',
      coeffB: 'Coeficiente B (Linear mesmo eixo)',
      coeffC: 'Coeficiente C (Linear eixo oposto)',
      coeffD: 'Constante D',
      coeffStd: 'Coeficiente linear k (onde 2p = |k|)',
      presetsTitle: 'Questões Típicas de Prova (Clique para resolver):',
      errorTitle: 'Erro de Entrada:'
    },
    summary: {
      title: 'Resumo dos Principais Resultados',
      copyBtn: 'Copiar Solução',
      copied: 'Copiado!',
      printBtn: 'Imprimir / Salvar PDF',
      vertex: 'Vértice V',
      focus: 'Foco F',
      directrix: 'Reta Diretriz',
      axisOfSym: 'Eixo de Simetria',
      direction: 'Sentido da Abertura',
      pParam: 'Parâmetro Focal p',
      halfPParam: 'Distância ao Vértice (p/2)',
      latusRectum: 'Latus Rectum (2p)',
      latusEndpoints: 'Extremidades do Latus Rectum',
      domain: 'Domínio',
      range: 'Imagem',
      standardEq: 'Equação Reduzida / Canônica',
      eccentricity: 'Excentricidade'
    },
    steps: {
      title: 'Resolução Detalhada Passo a Passo',
      subtitle: 'Completar quadrados, isolamento de variáveis e determinação das coordenadas.',
      collapseAll: 'Recolher Passos',
      expandAll: 'Expandir Todos os Passos',
      coreBadge: 'Ponto Crucial'
    },
    canvas: {
      title: 'Quadro Geométrico Interativo',
      zoomIn: 'Aproximar',
      zoomOut: 'Afastar',
      resetView: 'Restaurar',
      toggleProof: 'Ponto de Teste P: ',
      toggleLatus: 'Latus Rectum: ',
      dragPointNotice: 'Arraste o ponto P sobre a curva:',
      definitionProofTitle: 'Demonstração da Definição: |PF| = d(P, Diretriz)',
      curveLabel: 'Curva da Parábola',
      focusLabel: 'Foco F',
      directrixLabel: 'Diretriz l',
      latusLabel: 'Latus Rectum (2p)'
    },
    guide: {
      title: 'Guia de Orientação e Principais Pegadinhas de Prova',
      subtitle: 'Como nunca mais errar para onde a parábola abre nem confundir p com p/2.',
      tabTable: 'Tabela das 4 Formas Reduzidas',
      tabMnemonics: 'Macetes de Memorização',
      tabPitfalls: '4 Pegadinhas de Exames',
      tblEq: 'Equação Reduzida',
      tblDir: 'Sentido da Abertura',
      tblFocus: 'Coordenadas do Foco F',
      tblDirectrix: 'Equação da Reta Diretriz',
      tblAxis: 'Eixo Focal',
      tblNote: 'Nota: Na forma reduzida, p > 0. O sinal do termo linear define a orientação.',
      right: 'Abre para a Direita (→)',
      left: 'Abre para a Esquerda (←)',
      up: 'Abre para Cima (↑)',
      down: 'Abre para Baixo (↓)',
      rule1Title: 'Regra 1: Termo linear define o eixo, sinal define a direção',
      rule1Text: 'Observe a variável com expoente 1. Se for x, o eixo é horizontal (abre esquerda/direita). Se o coeficiente for positivo, abre para a direita; se negativo, para a esquerda.',
      rule2Title: 'Regra 2: O foco fica por dentro, a diretriz fica atrás do vértice',
      rule2Text: 'A parábola abraça o foco em seu interior. A reta diretriz sempre fica posicionada atrás do vértice.',
      rule3Title: 'Regra 3: Ambos distam meio passo (p/2) do vértice',
      rule3Text: 'Do vértice ao foco mede p/2. Do vértice à diretriz mede p/2. A distância total entre foco e diretriz é p.',
      pitfall1Title: 'Pegadinha 1: Confundir a função y = ax² com a equação reduzida',
      pitfall1Text: 'Em y = 2x², o número 2 NÃO é 2p! Deve-se isolar: x² = (1/2)y, logo 2p = 1/2 ⇒ p = 1/4 ⇒ o foco é (0, 1/8).',
      pitfall2Title: 'Pegadinha 2: Usar p em vez de p/2 para as coordenadas do foco',
      pitfall2Text: 'Se 2p = 8, então p = 4. Mas a distância do vértice ao foco é p/2 = 2. Cuidado para não responder (4, 0)!',
      pitfall3Title: 'Pegadinha 3: Responder apenas um número para a diretriz',
      pitfall3Text: 'A diretriz é uma reta! Responda sempre como equação de reta: "x = -2" ou "y = 1", nunca apenas "-2".',
      pitfall4Title: 'Pegadinha 4: Esquecer de multiplicar o valor adicionado ao completar quadrados',
      pitfall4Text: 'Ao colocar 2 em evidência 2(y² - 4y + 4), do outro lado deve-se somar 2 × 4 = 8, e não somente 4.'
    },
    quiz: {
      title: 'Desafio Rápido: Abertura e Foco',
      progress: 'Questão',
      score: 'Pontuação:',
      eqPrompt: 'Dada a equação:',
      restartBtn: 'Recomeçar',
      nextBtn: 'Próxima Questão',
      completed: 'Simulado concluído! Pontuação final:',
      correct: 'Correto!',
      wrong: 'Incorreto. Veja a explicação:'
    },
    faq: {
      title: 'Perguntas Frequentes & Fundamentos de Cônicas',
      q1: 'Qual é a definição geométrica da parábola?',
      a1: 'É o conjunto de todos os pontos de um plano equidistantes de um ponto fixo chamado Foco e de uma reta fixa chamada Diretriz: |PF| = d(P, Diretriz).',
      q2: 'Como encontrar o foco e a diretriz completando quadrados?',
      a2: '1. Deixe os termos da variável quadrática à esquerda. 2. Passe os termos lineares para a direita. 3. Some (b/2)² a ambos os lados. 4. Fatore o quadrado perfeito. 5. Fatore o coeficiente linear à direita para obter (y-k)² = 2p(x-h).',
      q3: 'Por que a distância do vértice ao foco é p/2 e não p?',
      a3: 'O parâmetro p representa a distância total entre o foco e a reta diretriz. Como o vértice está exatamente a meio caminho entre eles, sua distância ao foco é p/2.',
      q4: 'Como identificar de imediato para onde a parábola abre?',
      a4: 'Identifique qual variável possui expoente 1 (termo linear). Ela indica o eixo de simetria. O sinal do coeficiente indica o sentido (positivo para o semi-eixo positivo, negativo para o semi-eixo negativo).'
    },
    footer: {
      desc: 'Calculadora de Foco e Diretriz da Parábola · Plataforma de Geometria Analítica',
      rights: 'Passo a passo com notação LaTeX. Gratuito para estudantes e professores.'
    },
    keywords: {
      title: 'Tópicos Mais Pesquisados:',
      tags: [
        'Calculadora de foco e diretriz parábola',
        'Completar quadrados parábola passo a passo',
        'Como achar a reta diretriz da parábola',
        'Fórmula do latus rectum 2p',
        'Para onde abre a parábola macetes',
        'Equação reduzida da parábola',
        'Raio focal da parábola'
      ]
    }
  },

  // CHINESE (中文)
  zh: {
    meta: {
      title: '抛物线焦点与准线方程求解器 | 配方法详细步骤',
      description: '高二解析几何抛物线焦点与准线方程在线计算器，提供配方法完整拆解步骤、开口方向速判口诀与交互式几何画板验证。',
      badge1: '高二解析几何必考重点',
      badge2: '配方法逐级拆解',
      badge3: 'LaTeX 公式规范排版',
      badge4: '开口方向速判避坑'
    },
    nav: {
      brand: '抛物线求解器',
      steps: '配方法拆解与计算',
      canvas: '几何画板验证',
      rules: '开口速判口诀',
      quiz: '随堂自测闯关',
      faq: '常见疑问与高频考点',
      startBtn: '开始解题'
    },
    hero: {
      title: '抛物线焦点与准线方程在线求解',
      subtitle: '针对高二学生容易在配方法漏项、参数 p 与 p/2 混淆、开口方向搞反等痛点，提供规范详尽的解题步骤、配方法拆解过程与交互式几何画板证明。'
    },
    input: {
      title: '抛物线方程输入与模式选择',
      smartTab: '智能识别输入（直接输入方程）',
      generalTab: '一般式配方法拆解',
      standardTab: '标准方程（顶点在原点）',
      functionTab: '初高衔接函数式',
      smartPlaceholder: '支持直接输入方程，例如：y^2 - 4y - 8x + 12 = 0 或 y^2 = 8x 或 y = 0.25x^2',
      smartHelp: '智能解析引擎：支持粘贴任意方程，自动识别变量、系数与配方方式。',
      solveBtn: '立即开始步骤拆解',
      resetBtn: '重置',
      orientationLabel: '主变量方向：',
      horizOpt: 'y 为二次变量（水平轴向，左右开口）',
      vertOpt: 'x 为二次变量（竖直轴向，上下开口）',
      currentEq: '待解方程：',
      coeffA: '二次项系数 A',
      coeffB: '一次项系数 B',
      coeffC: '对侧一次项系数 C',
      coeffD: '常数项 D',
      coeffStd: '一次项系数 k（注意：|k| = 2p）',
      presetsTitle: '高二高频名校经典真题（点击即刻载入并全步骤拆解）：',
      errorTitle: '输入错误：'
    },
    summary: {
      title: '核心解题结论汇总',
      copyBtn: '复制结论',
      copied: '已复制！',
      printBtn: '打印 / 保存 PDF',
      vertex: '顶点坐标 V',
      focus: '焦点坐标 F',
      directrix: '准线方程',
      axisOfSym: '对称轴方程',
      direction: '开口方向',
      pParam: '焦参数 p',
      halfPParam: '顶点到焦点/准线距离 (p/2)',
      latusRectum: '通径长 (2p)',
      latusEndpoints: '通径两端点坐标',
      domain: '定义域',
      range: '值域',
      standardEq: '顶点标准形式',
      eccentricity: '离心率 e'
    },
    steps: {
      title: '详细解题步骤 · 配方法完整拆解过程',
      subtitle: '每一步骤严格遵循高中解析几何解题规范，步骤清晰，可直接作为考试解答题范本。',
      collapseAll: '收起步骤',
      expandAll: '展开全部步骤',
      coreBadge: '核心考点'
    },
    canvas: {
      title: '解析几何画板 · 动态轨迹与定义验证',
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '复位视口',
      toggleProof: '动点定义：',
      toggleLatus: '通径：',
      dragPointNotice: '滑动动点 P 位置：',
      definitionProofTitle: '抛物线第一定义验证：|PF| = d(P, 准线)',
      curveLabel: '抛物线曲线',
      focusLabel: '焦点 F',
      directrixLabel: '准线 l',
      latusLabel: '通径长 (2p)'
    },
    guide: {
      title: '高二高频考点 · 开口方向与易错点避坑指南',
      subtitle: '解析几何常见失分点：开口方向反、p与p/2混淆、初高中函数转换错误。',
      tabTable: '4种标准形态表',
      tabMnemonics: '开口速判口诀',
      tabPitfalls: '四大丢分陷阱',
      tblEq: '标准方程',
      tblDir: '图形开口',
      tblFocus: '焦点坐标 F',
      tblDirectrix: '准线方程',
      tblAxis: '对称轴',
      tblNote: '注：标准方程中要求参数 p > 0，一次项的符号反映开口的正负半轴方向。',
      right: '向右开口 (→)',
      left: '向左开口 (←)',
      up: '向上开口 (↑)',
      down: '向下开口 (↓)',
      rule1Title: '口诀一：一次定轴，符号定方',
      rule1Text: '看到方程后，先看谁是一次项：一次项是 x，对称轴就是 x 轴（左右开口）；一次项是 y，对称轴就是 y 轴（上下开口）。系数为正向正半轴开，系数为负向负半轴开。',
      rule2Title: '口诀二：焦点在内，准线在后',
      rule2Text: '抛物线就像双手捧着焦点——焦点永远在抛物线的开口怀抱内部，而准线永远在顶点的背后外侧。',
      rule3Title: '口诀三：各距半步，相隔整步',
      rule3Text: '一次项系数的绝对值是 2p。焦点到顶点的距离是 p/2；准线到顶点的距离也是 p/2。焦点到准线的距离整整为 p。',
      pitfall1Title: '陷阱一：初中二次函数式直接看系数求焦点（失分率最高！）',
      pitfall1Text: '在 y = 2x² 中，2 绝不是 2p！必须先把二次项系数化为 1：x² = (1/2)y，此时 2p = 1/2 ⇒ p = 1/4 ⇒ 焦点为 (0, 1/8)。',
      pitfall2Title: '陷阱二：算出了 p 却忘了再除以 2',
      pitfall2Text: '由 2p = 8 算得 p = 4，焦点到顶点的距离是 p/2 = 2，不是 4！许多考生误写为 (4, 0) 而丢分。',
      pitfall3Title: '陷阱三：准线方程漏写未知数直线形式',
      pitfall3Text: '准线是一条几何直线！在填空题中必须写成“x = -2”或“y = 1”，只写数字“-2”会被直接判零分。',
      pitfall4Title: '陷阱四：配方提取系数时右边忘记乘以公因数',
      pitfall4Text: '例如 2(y² - 4y + 4)，在方程右边必须同时加上 2 × 4 = 8，而不是仅加 4。'
    },
    quiz: {
      title: '开口方向与焦点速判 · 随堂自测闯关',
      progress: '题目',
      score: '得分：',
      eqPrompt: '题目方程：',
      restartBtn: '重新开始自测',
      nextBtn: '下一题',
      completed: '恭喜完成自测！总分：',
      correct: '回答正确！',
      wrong: '回答错误，看速判解析：'
    },
    faq: {
      title: '高二解析几何常见疑问与核心定理问答',
      q1: '抛物线的第一定义是什么？',
      a1: '平面内与一个定点 F（焦点）和一条定直线 l（准线，且定点不在定直线上）距离相等的点的轨迹叫做抛物线。即恒有 |PF| = d(P, l)。',
      q2: '抛物线一般方程如何通过配方法化为标准方程？',
      a2: '第一步将二次变量保留在等式左边，其余项移到右边；第二步将二次项系数化为 1；第三步左右两边同时加上一次项系数一半的平方；第四步左边写成完全平方式，右边提取一次项系数，即得标准顶点式。',
      q3: '为什么顶点到焦点的距离是 p/2 而不是 p？',
      a3: '因为焦点到准线的距离整整是 p，而顶点恰好位于焦点与准线的正中点，根据中点平分性质，顶点到焦点的距离与到准线的距离各为 p/2。',
      q4: '如何一眼看清开口方向，不再搞反？',
      a4: '牢记口诀：“一次定轴，符号定方”。找方程里唯一的一次项变量：如果是一次项为 x，对称轴就沿着 x 轴；如果一次项系数为正，就向 x 轴正方向（向右）开口；若为负就向左开。'
    },
    footer: {
      desc: '抛物线焦点与准线方程求解器 · 专注高考数学与高二解析几何复习',
      rights: '所有解题步骤采用 LaTeX 数学规范排版。免费供高中师生学习使用。'
    },
    keywords: {
      title: '高频考点与热搜词汇：',
      tags: [
        '抛物线焦点计算器在线',
        '抛物线准线方程怎么求',
        '抛物线配方法拆解过程',
        '高二抛物线开口方向速判口诀',
        '抛物线通径长公式2p',
        '顶点式(y-k)²=2p(x-h)',
        '焦半径公式秒杀题'
      ]
    }
  }
};
