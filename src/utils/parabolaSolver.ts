import {
  Fraction,
  formatFractionLaTeX,
  formatShiftTerm,
  formatSignedTermLaTeX,
  toFraction
} from './fraction.ts';
import { Language } from '../i18n/translations.ts';

export type ParabolaOrientation = 'horizontal' | 'vertical'; // horizontal: y is squared, vertical: x is squared
export type OpenDirection = 'right' | 'left' | 'up' | 'down';

export interface StepExplanation {
  title: string;
  math: string;
  note?: string;
  highlight?: boolean;
}

export interface ParabolaAnalysisResult {
  orientation: ParabolaOrientation;
  direction: OpenDirection;
  vertex: { x: number; y: number; xFrac: Fraction; yFrac: Fraction };
  p: number; // always > 0
  pFrac: Fraction;
  halfP: number; // p / 2
  halfPFrac: Fraction;
  focus: { x: number; y: number; xFrac: Fraction; yFrac: Fraction };
  directrix: {
    type: 'x' | 'y';
    val: number;
    valFrac: Fraction;
    latex: string;
  };
  axisOfSymmetry: {
    type: 'x' | 'y';
    val: number;
    valFrac: Fraction;
    latex: string;
  };
  latusRectum: number; // 2p
  latusEndpoints: {
    p1: { x: number; y: number; latex: string };
    p2: { x: number; y: number; latex: string };
  };
  domainLatex: string;
  rangeLatex: string;
  standardVertexLatex: string;
  steps: StepExplanation[];
  mnemonics: {
    axisMnemonic: string;
    directionMnemonic: string;
    keyDistanceRule: string;
    focalRadiusFormula: string;
  };
}

/**
 * Solve parabola from general quadratic equation:
 * If orientation === 'horizontal': A*y^2 + B*y + C*x + D = 0  (A != 0, C != 0)
 * If orientation === 'vertical':   A*x^2 + B*x + C*y + D = 0  (A != 0, C != 0)
 */
export function solveParabolaGeneral(
  orientation: ParabolaOrientation,
  A: number,
  B: number,
  C: number,
  D: number,
  lang: Language = 'en'
): ParabolaAnalysisResult {
  if (Math.abs(A) < 1e-7) {
    throw new Error(
      lang === 'zh'
        ? '二次项系数 A 不能为 0，否则退化为一次直线方程'
        : 'Leading quadratic coefficient A cannot be zero.'
    );
  }
  if (Math.abs(C) < 1e-7) {
    throw new Error(
      lang === 'zh'
        ? '一次项系数 C 不能为 0，否则方程无一次变量，退化为平行直线对'
        : 'Opposite linear coefficient C cannot be zero.'
    );
  }

  const steps: StepExplanation[] = [];

  // Variables designation
  const quadVar = orientation === 'horizontal' ? 'y' : 'x';
  const linVar = orientation === 'horizontal' ? 'x' : 'y';

  // Original equation representation
  let origEq = '';
  if (A === 1) origEq += `${quadVar}^2`;
  else if (A === -1) origEq += `-${quadVar}^2`;
  else origEq += `${formatFractionLaTeX(A)}${quadVar}^2`;

  origEq += formatSignedTermLaTeX(B, quadVar);
  origEq += formatSignedTermLaTeX(C, linVar);
  origEq += formatSignedTermLaTeX(D);
  origEq += ' = 0';

  const t1 = {
    en: {
      title: 'Step 1: Identify Quadratic vs Linear Variables',
      note: `The quadratic variable is $${quadVar}$, and the linear variable is $${linVar}$. The axis of symmetry is parallel to the $${linVar}$-axis.`
    },
    es: {
      title: 'Paso 1: Identificar Variable Cuadrática y Lineal',
      note: `La variable cuadrática es $${quadVar}$ y la lineal es $${linVar}$. El eje de simetría es paralelo al eje $${linVar}$.`
    },
    fr: {
      title: 'Étape 1 : Identifier la Variable Carrée et Linéaire',
      note: `La variable au carré est $${quadVar}$ et la variable linéaire est $${linVar}$. L'axe de symétrie est parallèle à l'axe $${linVar}$.`
    },
    pt: {
      title: 'Passo 1: Identificar Variável Quadrática e Linear',
      note: `A variável quadrática é $${quadVar}$ e a linear é $${linVar}$. O eixo de simetria é paralelo ao eixo $${linVar}$.`
    },
    zh: {
      title: '第一步：分析原方程并确定主次变量',
      note: `二次项变量为 $${quadVar}$，一次项变量为 $${linVar}$。一次项变量所在轴即为对称轴方向，此抛物线对称轴平行于 $${linVar}$ 轴。`
    }
  }[lang];

  steps.push({
    title: t1.title,
    math: origEq,
    note: t1.note
  });

  // Step 2: 移项分拣
  const rhsLinCoeff = -C;
  const rhsConst = -D;

  let step2Math = '';
  if (A === 1) step2Math += `${quadVar}^2`;
  else if (A === -1) step2Math += `-${quadVar}^2`;
  else step2Math += `${formatFractionLaTeX(A)}${quadVar}^2`;
  step2Math += formatSignedTermLaTeX(B, quadVar);
  step2Math += ` = ${formatSignedTermLaTeX(rhsLinCoeff, linVar).trim() || '0'}${formatSignedTermLaTeX(rhsConst)}`;

  const t2 = {
    en: {
      title: 'Step 2: Group Squared Terms on Left Side',
      note: `Keep all terms containing the squared variable $${quadVar}$ on the left-hand side, and move the linear variable $${linVar}$ and constant to the right-hand side.`
    },
    es: {
      title: 'Paso 2: Aislar los Términos Cuadráticos a la Izquierda',
      note: `Dejamos los términos con la variable cuadrática $${quadVar}$ a la izquierda y pasamos los términos en $${linVar}$ y constantes a la derecha.`
    },
    fr: {
      title: 'Étape 2 : Regrouper les Termes Carrés à Gauche',
      note: `Conserver les termes avec $${quadVar}$ à gauche et basculer les termes en $${linVar}$ et constantes à droite.`
    },
    pt: {
      title: 'Passo 2: Isolar os Termos Quadráticos à Esquerda',
      note: `Manter os termos com a variável quadrática $${quadVar}$ à esquerda e passar a variável linear $${linVar}$ e constante para a direita.`
    },
    zh: {
      title: '第二步：移项分拣（配方法准备）',
      note: `将含二次变量 $${quadVar}$ 的所有项保留在方程左边，将含一次变量 $${linVar}$ 及常数项移到方程右边。`
    }
  }[lang];

  steps.push({
    title: t2.title,
    math: step2Math,
    note: t2.note
  });

  // Step 3: 二次项系数化为 1
  const bOverA = B / A;
  const cOverA = rhsLinCoeff / A;
  const dOverA = rhsConst / A;

  let step3Math = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} = `;
  step3Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)}`;

  if (Math.abs(A - 1) > 1e-7) {
    const t3 = {
      en: {
        title: 'Step 3: Normalize Leading Coefficient to 1',
        note: `Divide both sides by the leading coefficient $A = ${formatFractionLaTeX(A)}$ so the squared term has coefficient 1.`
      },
      es: {
        title: 'Paso 3: Dividir por el Coeficiente Principal',
        note: `Dividimos ambos lados entre $A = ${formatFractionLaTeX(A)}$ para que el coeficiente cuadrático sea 1.`
      },
      fr: {
        title: 'Étape 3 : Normaliser le Coefficient Principal à 1',
        note: `Diviser les deux membres par $A = ${formatFractionLaTeX(A)}$ pour obtenir un coefficient unitaire.`
      },
      pt: {
        title: 'Passo 3: Normalizar o Coeficiente Quadrático para 1',
        note: `Dividimos ambos os lados por $A = ${formatFractionLaTeX(A)}$ para tornar o coeficiente do termo quadrático igual a 1.`
      },
      zh: {
        title: '第三步：两边同除以二次项系数（系数归一）',
        note: `两边同除以二次项系数 $A = ${formatFractionLaTeX(A)}$，使二次项系数化为 1，便于进行完全平方式配方。`
      }
    }[lang];

    steps.push({
      title: t3.title,
      math: step3Math,
      note: t3.note
    });
  }

  // Step 4: 配方法核心拆解 (Add (b/2A)^2 to both sides)
  const halfB = bOverA / 2;
  const addConst = halfB * halfB;

  let step4Math = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} + ${formatFractionLaTeX(addConst)} = `;
  step4Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)} + ${formatFractionLaTeX(addConst)}`;

  const t4 = {
    en: {
      title: 'Step 4: Completing the Square (Add (b/2)² to both sides)',
      note: `The linear coefficient of $${quadVar}$ is $${formatFractionLaTeX(bOverA)}$. Half of it is $${formatFractionLaTeX(halfB)}$, and its square is $\\left(${formatFractionLaTeX(halfB)}\\right)^2 = ${formatFractionLaTeX(addConst)}$. Add $${formatFractionLaTeX(addConst)}$ to both sides.`
    },
    es: {
      title: 'Paso 4: Completar el Cuadrado (Sumar (b/2)² a ambos lados)',
      note: `El coeficiente de $${quadVar}$ es $${formatFractionLaTeX(bOverA)}$. La mitad es $${formatFractionLaTeX(halfB)}$, y su cuadrado es $${formatFractionLaTeX(addConst)}$. Sumamos $${formatFractionLaTeX(addConst)}$ en ambos miembros.`
    },
    fr: {
      title: 'Étape 4 : Complétion du Carré (Ajouter (b/2)² aux deux membres)',
      note: `Le coefficient linéaire de $${quadVar}$ est $${formatFractionLaTeX(bOverA)}$. Sa moitié est $${formatFractionLaTeX(halfB)}$, son carré est $${formatFractionLaTeX(addConst)}$. On ajoute $${formatFractionLaTeX(addConst)}$ des deux côtés.`
    },
    pt: {
      title: 'Passo 4: Completar o Quadrado (Somar (b/2)² a ambos os lados)',
      note: `O coeficiente linear de $${quadVar}$ é $${formatFractionLaTeX(bOverA)}$. Sua metade é $${formatFractionLaTeX(halfB)}$, e seu quadrado é $${formatFractionLaTeX(addConst)}$. Somamos $${formatFractionLaTeX(addConst)}$ a ambos os lados.`
    },
    zh: {
      title: '第四步：配方法核心拆解（两边同时加一次项系数一半的平方）',
      note: `一次项 $${quadVar}$ 的系数为 $${formatFractionLaTeX(bOverA)}$，其一半为 $${formatFractionLaTeX(halfB)}$，其平方为 $\\left(${formatFractionLaTeX(halfB)}\\right)^2 = ${formatFractionLaTeX(addConst)}$。根据等式性质，两边同时加上 $${formatFractionLaTeX(addConst)}$。`
    }
  }[lang];

  steps.push({
    title: t4.title,
    math: step4Math,
    note: t4.note,
    highlight: true
  });

  // Step 5: 左边完全平方，右边合并常数
  const rhsCombinedConst = dOverA + addConst;
  const quadShift = -halfB;

  let step5Math = `${formatShiftTerm(quadVar, quadShift)}^2 = `;
  step5Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(rhsCombinedConst)}`;

  const t5 = {
    en: {
      title: 'Step 5: Factor Left Side into Perfect Square',
      note: `The left-hand side contracts into $${formatShiftTerm(quadVar, quadShift)}^2$. Combine constants on the right to get $${formatFractionLaTeX(rhsCombinedConst)}$.`
    },
    es: {
      title: 'Paso 5: Factorizar el Trinomio Cuadrado Perfecto',
      note: `El lado izquierdo se convierte en $${formatShiftTerm(quadVar, quadShift)}^2$. Combinamos las constantes del lado derecho.`
    },
    fr: {
      title: 'Étape 5 : Factoriser en Carré Parfait',
      note: `Le membre de gauche devient $${formatShiftTerm(quadVar, quadShift)}^2$. On regroupe les constantes de droite.`
    },
    pt: {
      title: 'Passo 5: Fatorar como Quadrado Perfeito',
      note: `O lado esquerdo torna-se $${formatShiftTerm(quadVar, quadShift)}^2$. Somamos as constantes do lado direito.`
    },
    zh: {
      title: '第五步：左边化完全平方式，右边合并同类项',
      note: `左边利用完全平方公式收拢为 $${formatShiftTerm(quadVar, quadShift)}^2$；右边常数项合并为 $${formatFractionLaTeX(rhsCombinedConst)}$。`
    }
  }[lang];

  steps.push({
    title: t5.title,
    math: step5Math,
    note: t5.note
  });

  // Step 6: 右边提取一次项系数，化为顶点标准式
  const linShift = -rhsCombinedConst / cOverA;

  let step6Math = `${formatShiftTerm(quadVar, quadShift)}^2 = `;
  if (cOverA === 1) {
    step6Math += `${formatShiftTerm(linVar, linShift)}`;
  } else if (cOverA === -1) {
    step6Math += `-${formatShiftTerm(linVar, linShift)}`;
  } else {
    step6Math += `${formatFractionLaTeX(cOverA)} ${formatShiftTerm(linVar, linShift)}`;
  }

  const t6 = {
    en: {
      title: 'Step 6: Factor Out Linear Coefficient (Standard Form)',
      note: `Factor out $${formatFractionLaTeX(cOverA)}$ on the right side to write the equation in standard vertex form.`
    },
    es: {
      title: 'Paso 6: Extraer Factor Común (Forma Canónica)',
      note: `Sacamos factor común $${formatFractionLaTeX(cOverA)}$ para obtener la forma canónica con el vértice visible.`
    },
    fr: {
      title: 'Étape 6 : Factoriser le Coefficient Linéaire (Forme Canonique)',
      note: `Mettre en facteur $${formatFractionLaTeX(cOverA)}$ à droite pour obtenir la forme canonique.`
    },
    pt: {
      title: 'Passo 6: Fatorar o Coeficiente Linear (Forma Canônica)',
      note: `Colocamos $${formatFractionLaTeX(cOverA)}$ em evidência para obter a equação reduzida da parábola.`
    },
    zh: {
      title: '第六步：右边提取一次项系数，化为顶点标准式',
      note: `提取一次项系数 $${formatFractionLaTeX(cOverA)}$，化为顶点标准方程形式。由式子可直接读出顶点坐标与开口方向基数。`
    }
  }[lang];

  steps.push({
    title: t6.title,
    math: step6Math,
    note: t6.note,
    highlight: true
  });

  // Calculate parameters
  const twoP = Math.abs(cOverA);
  const p = twoP / 2;
  const halfP = p / 2;

  let direction: OpenDirection;
  let h = 0;
  let k = 0;

  if (orientation === 'horizontal') {
    k = quadShift;
    h = linShift;
    direction = cOverA > 0 ? 'right' : 'left';
  } else {
    h = quadShift;
    k = linShift;
    direction = cOverA > 0 ? 'up' : 'down';
  }

  // Step 7: 提取参数 p 与 p/2
  const step7Math = `2p = |${formatFractionLaTeX(cOverA)}| = ${formatFractionLaTeX(twoP)} \\implies p = ${formatFractionLaTeX(p)}, \\quad \\frac{p}{2} = ${formatFractionLaTeX(halfP)}`;
  const t7 = {
    en: {
      title: 'Step 7: Extract Focal Parameter p and Half-Step p/2',
      note: `The coefficient of the linear factor is $2p = ${formatFractionLaTeX(twoP)}$, so $p = ${formatFractionLaTeX(p)}$. The distance from vertex to focus and to directrix is $p/2 = ${formatFractionLaTeX(halfP)}$, NOT $p$!`
    },
    es: {
      title: 'Paso 7: Extraer el Parámetro Focal p y la Distancia p/2',
      note: `El coeficiente lineal es $2p = ${formatFractionLaTeX(twoP)}$, por lo que $p = ${formatFractionLaTeX(p)}$. La distancia del vértice al foco y a la directriz es $p/2 = ${formatFractionLaTeX(halfP)}$, ¡NO $p$!`
    },
    fr: {
      title: 'Étape 7 : Déduire le Paramètre Focal p et le Demi-Écart p/2',
      note: `Le coefficient vaut $2p = ${formatFractionLaTeX(twoP)}$, d'où $p = ${formatFractionLaTeX(p)}$. La distance sommet-foyer est $p/2 = ${formatFractionLaTeX(halfP)}$, et NON $p$ !`
    },
    pt: {
      title: 'Passo 7: Extrair o Parâmetro Focal p e o Meio-Passo p/2',
      note: `O coeficiente linear é $2p = ${formatFractionLaTeX(twoP)}$, logo $p = ${formatFractionLaTeX(p)}$. A distância do vértice ao foco e à diretriz é $p/2 = ${formatFractionLaTeX(halfP)}$, NÃO $p$!`
    },
    zh: {
      title: '第七步：提取焦参数 p 与核心距离 p/2',
      note: `一次项系数绝对值等于 $2p$，故 $p = ${formatFractionLaTeX(p)}$。在求焦点与准线时，到顶点的距离是 $\\frac{p}{2} = ${formatFractionLaTeX(halfP)}$，绝不是 $p$！`
    }
  }[lang];

  steps.push({
    title: t7.title,
    math: step7Math,
    note: t7.note
  });

  // Step 8: 开口方向速判
  const dirNames: Record<Language, Record<OpenDirection, string>> = {
    en: { right: 'Opens Right (→)', left: 'Opens Left (←)', up: 'Opens Up (↑)', down: 'Opens Down (↓)' },
    es: { right: 'Abre a la Derecha (→)', left: 'Abre a la Izquierda (←)', up: 'Abre a la Izquierda (←)', down: 'Abre hacia Abajo (↓)' },
    fr: { right: 'Ouverte vers la Droite (→)', left: 'Ouverte vers la Gauche (←)', up: 'Ouverte vers le Haut (↑)', down: 'Ouverte vers le Bas (↓)' },
    pt: { right: 'Abre para a Direita (→)', left: 'Abre para a Esquerda (←)', up: 'Abre para Cima (↑)', down: 'Abre para Baixo (↓)' },
    zh: { right: '向右开口 (→)', left: '向左开口 (←)', up: '向上开口 (↑)', down: '向下开口 (↓)' }
  };

  const t8 = {
    en: {
      title: 'Step 8: Determine Opening Direction',
      note: `Linear variable is $${linVar}$ and its coefficient is ${cOverA > 0 ? 'positive' : 'negative'}. Rule: "Linear variable dictates axis, sign dictates direction".`
    },
    es: {
      title: 'Paso 8: Determinación de la Concavidad / Apertura',
      note: `La variable lineal es $${linVar}$ y su signo es ${cOverA > 0 ? 'positivo' : 'negativo'}. Regla: "El término lineal indica el eje y el signo indica la dirección".`
    },
    fr: {
      title: 'Étape 8 : Détermination du Sens d\'Ouverture',
      note: `La variable linéaire est $${linVar}$ et le signe est ${cOverA > 0 ? 'positif' : 'négatif'}. Règle : "La variable linéaire donne l'axe, le signe donne le sens".`
    },
    pt: {
      title: 'Passo 8: Determinação do Sentido da Abertura',
      note: `A variável linear é $${linVar}$ e o sinal é ${cOverA > 0 ? 'positivo' : 'negativo'}. Regra: "A variável linear define o eixo e o sinal define a orientação".`
    },
    zh: {
      title: '第八步：开口方向判定（速判口诀）',
      note: `平方项为 $${quadVar}$，一次项为 $${linVar}$，一次项系数符号为 ${cOverA > 0 ? '正' : '负'}。速记口诀：“一次定轴，符号定方”。`
    }
  }[lang];

  steps.push({
    title: t8.title,
    math: `\\text{${lang === 'zh' ? '开口方向' : 'Direction'}: } \\mathbf{${dirNames[lang][direction]}}`,
    note: t8.note
  });

  // Calculate Focus and Directrix
  let focusX = h;
  let focusY = k;
  let directrixVal = 0;
  let directrixType: 'x' | 'y' = 'x';
  let axisVal = 0;
  let axisType: 'x' | 'y' = 'y';

  if (direction === 'right') {
    focusX = h + halfP;
    focusY = k;
    directrixType = 'x';
    directrixVal = h - halfP;
    axisType = 'y';
    axisVal = k;
  } else if (direction === 'left') {
    focusX = h - halfP;
    focusY = k;
    directrixType = 'x';
    directrixVal = h + halfP;
    axisType = 'y';
    axisVal = k;
  } else if (direction === 'up') {
    focusX = h;
    focusY = k + halfP;
    directrixType = 'y';
    directrixVal = k - halfP;
    axisType = 'x';
    axisVal = h;
  } else {
    focusX = h;
    focusY = k - halfP;
    directrixType = 'y';
    directrixVal = k + halfP;
    axisType = 'x';
    axisVal = h;
  }

  const directrixLatex = `${directrixType} = ${formatFractionLaTeX(directrixVal)}`;
  const axisLatex = `${axisType} = ${formatFractionLaTeX(axisVal)}`;

  const t9 = {
    en: {
      title: 'Step 9: Compute Vertex, Focus, and Directrix',
      note: 'The vertex is the base point. Focus lies inside the parabola shifted by p/2; the directrix lies behind the vertex shifted by p/2. Always write the directrix as an equation (e.g. x = ...).'
    },
    es: {
      title: 'Paso 9: Coordenadas del Vértice, Foco y Ecuación de la Directriz',
      note: 'El vértice es el origen del desplazamiento. El foco avanza p/2 en el sentido de apertura; la directriz retrocede p/2. Escribe siempre la directriz como una ecuación.'
    },
    fr: {
      title: 'Étape 9 : Coordonnées du Sommet, du Foyer et Équation de la Directrice',
      note: 'Le sommet est le point de référence. Le foyer est à l\'intérieur à distance p/2 ; la directrice est à l\'extérieur à distance p/2.'
    },
    pt: {
      title: 'Passo 9: Vértice, Foco e Reta Diretriz',
      note: 'O vértice é a referência. O foco desloca-se p/2 para dentro da curva; a diretriz recua p/2. A diretriz deve ser escrita sempre como equação de reta.'
    },
    zh: {
      title: '第九步：计算顶点、焦点坐标与准线方程',
      note: '顶点是基准点。焦点在抛物线内部（沿开口方向平移 p/2），准线在抛物线外侧（沿反方向平移 p/2）。注意：准线必须写成方程形式！'
    }
  }[lang];

  steps.push({
    title: t9.title,
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '顶点' : 'Vertex'} } V &: \\left(${formatFractionLaTeX(h)},\\ ${formatFractionLaTeX(k)}\\right) \\\\[6pt]
      \\text{${lang === 'zh' ? '焦点' : 'Focus'} } F &: \\left(${formatFractionLaTeX(focusX)},\\ ${formatFractionLaTeX(focusY)}\\right) \\\\[6pt]
      \\text{${lang === 'zh' ? '准线方程' : 'Directrix'} } &: ${directrixLatex} \\\\[6pt]
      \\text{${lang === 'zh' ? '对称轴' : 'Axis'} } &: ${axisLatex}
    \\end{aligned}`,
    note: t9.note,
    highlight: true
  });

  // Latus Rectum Endpoints calculation
  let ep1X = focusX, ep1Y = focusY, ep2X = focusX, ep2Y = focusY;
  if (orientation === 'horizontal') {
    ep1Y = focusY + p;
    ep2Y = focusY - p;
  } else {
    ep1X = focusX + p;
    ep2X = focusX - p;
  }

  // Domain & Range
  let domainLatex = '';
  let rangeLatex = '';
  if (orientation === 'horizontal') {
    rangeLatex = '(-\\infty, \\infty)';
    if (direction === 'right') {
      domainLatex = `[${formatFractionLaTeX(h)}, \\infty)`;
    } else {
      domainLatex = `(-\\infty, ${formatFractionLaTeX(h)}]`;
    }
  } else {
    domainLatex = '(-\\infty, \\infty)';
    if (direction === 'up') {
      rangeLatex = `[${formatFractionLaTeX(k)}, \\infty)`;
    } else {
      rangeLatex = `(-\\infty, ${formatFractionLaTeX(k)}]`;
    }
  }

  // Step 10: 通径与拓展
  const t10 = {
    en: {
      title: 'Step 10: Latus Rectum and Endpoints',
      note: 'The latus rectum is the focal chord perpendicular to the axis of symmetry. Its length is 2p. The endpoints allow you to sketch the exact width of the parabola.'
    },
    es: {
      title: 'Paso 10: Lado Recto y Extremos de la Cuerda Focal',
      note: 'El lado recto es el segmento focal perpendicular al eje de simetría. Su longitud es 2p. Sus extremos permiten trazar con precisión la apertura.'
    },
    fr: {
      title: 'Étape 10 : Corde Focale (Latus Rectum) et Extrémités',
      note: 'La corde focale perpendiculaire à l\'axe mesure 2p. Ses extrémités permettent de tracer la courbure exacte.'
    },
    pt: {
      title: 'Passo 10: Latus Rectum e Extremidades',
      note: 'O latus rectum é a corda focal perpendicular ao eixo de simetria com comprimento 2p. Suas extremidades definem a largura da parábola.'
    },
    zh: {
      title: '第十步：通径长与端点坐标拓展',
      note: '通径为过焦点且垂直于对称轴的弦，长为 2p。端点坐标可用于精准绘制抛物线开口宽度。'
    }
  }[lang];

  steps.push({
    title: t10.title,
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '通径长' : 'Latus Rectum'}} &: 2p = ${formatFractionLaTeX(twoP)} \\\\[4pt]
      \\text{${lang === 'zh' ? '通径端点' : 'Ends of Latus Rectum'}} &: L_1\\left(${formatFractionLaTeX(ep1X)}, ${formatFractionLaTeX(ep1Y)}\\right),\\ L_2\\left(${formatFractionLaTeX(ep2X)}, ${formatFractionLaTeX(ep2Y)}\\right)
    \\end{aligned}`,
    note: t10.note
  });

  return {
    orientation,
    direction,
    vertex: {
      x: h,
      y: k,
      xFrac: toFraction(h),
      yFrac: toFraction(k)
    },
    p,
    pFrac: toFraction(p),
    halfP,
    halfPFrac: toFraction(halfP),
    focus: {
      x: focusX,
      y: focusY,
      xFrac: toFraction(focusX),
      yFrac: toFraction(focusY)
    },
    directrix: {
      type: directrixType,
      val: directrixVal,
      valFrac: toFraction(directrixVal),
      latex: directrixLatex
    },
    axisOfSymmetry: {
      type: axisType,
      val: axisVal,
      valFrac: toFraction(axisVal),
      latex: axisLatex
    },
    latusRectum: twoP,
    latusEndpoints: {
      p1: { x: ep1X, y: ep1Y, latex: `(${formatFractionLaTeX(ep1X)}, ${formatFractionLaTeX(ep1Y)})` },
      p2: { x: ep2X, y: ep2Y, latex: `(${formatFractionLaTeX(ep2X)}, ${formatFractionLaTeX(ep2Y)})` }
    },
    domainLatex,
    rangeLatex,
    standardVertexLatex: step6Math,
    steps,
    mnemonics: {
      axisMnemonic: `Linear variable ${linVar} sets axis parallel to ${linVar}`,
      directionMnemonic: `Linear sign ${cOverA > 0 ? '(+)' : '(-)'} opens ${cOverA > 0 ? 'positive' : 'negative'}`,
      keyDistanceRule: `Distance Vertex-Focus = Distance Vertex-Directrix = p/2 = ${formatFractionLaTeX(halfP)}`,
      focalRadiusFormula: `|PF| = d(P, Directrix)`
    }
  };
}

export function solveParabolaStandard(
  orientation: ParabolaOrientation,
  coeff: number,
  lang: Language = 'en'
): ParabolaAnalysisResult {
  return solveParabolaGeneral(orientation, 1, 0, -coeff, 0, lang);
}

export function solveParabolaFunction(
  orientation: ParabolaOrientation,
  a: number,
  b: number,
  c: number,
  lang: Language = 'en'
): ParabolaAnalysisResult {
  return solveParabolaGeneral(orientation, a, b, -1, c, lang);
}

export function solveParabolaVertexForm(
  orientation: ParabolaOrientation,
  h: number,
  k: number,
  twoP_coeff: number,
  lang: Language = 'en'
): ParabolaAnalysisResult {
  const quadShift = orientation === 'horizontal' ? k : h;
  const linShift = orientation === 'horizontal' ? h : k;

  const A = 1;
  const B = -2 * quadShift;
  const C = -twoP_coeff;
  const D = quadShift * quadShift + twoP_coeff * linShift;

  return solveParabolaGeneral(orientation, A, B, C, D, lang);
}
