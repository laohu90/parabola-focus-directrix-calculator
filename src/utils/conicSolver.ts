import {
  Fraction,
  formatFractionLaTeX,
  formatShiftTerm,
  formatSignedTermLaTeX,
  toFraction
} from './fraction.ts';
import { ConicAnalysisResult, StepExplanation, ParabolaOrientation, OpenDirection } from './conicTypes.ts';
import { Language } from '../i18n/translations.ts';

/**
 * Solve Parabola:
 * Horizontal: A*y^2 + B*y + C*x + D = 0  (A != 0, C != 0)
 * Vertical:   A*x^2 + B*x + C*y + D = 0  (A != 0, C != 0)
 */
export function solveParabola(
  orientation: ParabolaOrientation,
  A: number,
  B: number,
  C: number,
  D: number,
  lang: Language = 'en'
): ConicAnalysisResult {
  if (Math.abs(A) < 1e-7) throw new Error(lang === 'zh' ? '二次项系数 A 不能为 0' : 'Coefficient A cannot be 0.');
  if (Math.abs(C) < 1e-7) throw new Error(lang === 'zh' ? '一次变量系数 C 不能为 0' : 'Linear coefficient C cannot be 0.');

  const steps: StepExplanation[] = [];
  const quadVar = orientation === 'horizontal' ? 'y' : 'x';
  const linVar = orientation === 'horizontal' ? 'x' : 'y';

  // Original equation
  let origEq = '';
  if (A === 1) origEq += `${quadVar}^2`;
  else if (A === -1) origEq += `-${quadVar}^2`;
  else origEq += `${formatFractionLaTeX(A)}${quadVar}^2`;
  origEq += formatSignedTermLaTeX(B, quadVar);
  origEq += formatSignedTermLaTeX(C, linVar);
  origEq += formatSignedTermLaTeX(D);
  origEq += ' = 0';

  steps.push({
    title: lang === 'zh' ? '第一步：分析方程类型与主次变量' : 'Step 1: Analyze Variable Degrees & Conic Type',
    math: origEq,
    note: lang === 'zh'
      ? `方程中只有单一变量 $${quadVar}$ 存在二次方，另一变量 $${linVar}$ 为一次方。根据圆锥曲线判别定理，此类方程严格表示抛物线。`
      : `Only variable $${quadVar}$ has degree 2, while $${linVar}$ has degree 1. Therefore, this equation represents a parabola.`,
    whyExplanation: lang === 'zh'
      ? '【为什么只有抛物线有一个二次项？】圆锥曲线的代数判别式 $\\Delta = B^2 - 4AC$。当且仅当一个变量为二次而另一个为一次时，曲线无法闭合且只有一条对称轴，因而必定为抛物线。'
      : '[Why exactly one squared variable?] A parabola is the boundary case between ellipse and hyperbola (eccentricity e = 1). In the general conic equation, having only one squared variable ensures an open curve with a single axis of symmetry.'
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

  steps.push({
    title: lang === 'zh' ? '第二步：移项分拣（隔离二次与一次变量）' : 'Step 2: Group Squared Terms on Left Side',
    math: step2Math,
    note: lang === 'zh'
      ? `将含二次变量 $${quadVar}$ 的项保留在左侧，将一次项 $${linVar}$ 及常数项移至等号右侧。`
      : `Keep all terms of $${quadVar}$ on the left-hand side and move linear variable $${linVar}$ and constants to the right.`,
    whyExplanation: lang === 'zh'
      ? '【为什么必须将二次项与一次项分离两边？】配方法的目标是将二次多项式 $Au^2 + Bu$ 转化为单一的完全平方式 $(u-k)^2$。右边需要保持为 $2p(v-h)$ 的形式，分离两端能够避免变量交叉混淆。'
      : '[Why isolate the squared terms?] The target form is (variable - coordinate)² = 2p(other variable - coordinate). Separating variables on opposite sides prevents linear cross-interference.'
  });

  // Step 3: 系数归一
  const bOverA = B / A;
  const cOverA = rhsLinCoeff / A;
  const dOverA = rhsConst / A;

  let step3Math = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} = `;
  step3Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)}`;

  if (Math.abs(A - 1) > 1e-7) {
    steps.push({
      title: lang === 'zh' ? '第三步：两边同除以二次项系数（首项归一）' : 'Step 3: Divide by Leading Coefficient',
      math: step3Math,
      note: lang === 'zh'
        ? `方程两边同时除以 $A = ${formatFractionLaTeX(A)}$，使二次项系数化为 1。`
        : `Divide both sides by $A = ${formatFractionLaTeX(A)}$ so the leading coefficient becomes 1.`,
      whyExplanation: lang === 'zh'
        ? '【为什么必须将二次项系数化为 1？】初中完全平方公式为 $(u \\pm k)^2 = u^2 \\pm 2ku + k^2$。公式要求 $u^2$ 的系数严格为 1。如果不先除以 $A$，直接加常数会导致 $(Au+k)^2 = A^2u^2 + 2Aku + k^2$，产生系数 $A^2$ 的错误！'
        : '[Why normalize to 1?] The standard expansion (u + k)² = u² + 2ku + k² strictly assumes a unit coefficient on u². Normalizing by A eliminates distortion when calculating the constant to add.'
    });
  }

  // Step 4: 配方法核心加常数
  const halfB = bOverA / 2;
  const addConst = halfB * halfB;

  let step4Math = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} + ${formatFractionLaTeX(addConst)} = `;
  step4Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)} + ${formatFractionLaTeX(addConst)}`;

  steps.push({
    title: lang === 'zh' ? '第四步：配方法核心拆解（两边同时加一次项系数一半的平方）' : 'Step 4: Add (b/2)² to Both Sides',
    math: step4Math,
    note: lang === 'zh'
      ? `一次项系数为 $${formatFractionLaTeX(bOverA)}$，其一半为 $${formatFractionLaTeX(halfB)}$，其平方为 $\\left(${formatFractionLaTeX(halfB)}\\right)^2 = ${formatFractionLaTeX(addConst)}$。两边同时加上该数值。`
      : `Linear coefficient is $${formatFractionLaTeX(bOverA)}$. Half is $${formatFractionLaTeX(halfB)}$, and square is $${formatFractionLaTeX(addConst)}$. Add to both sides.`,
    whyExplanation: lang === 'zh'
      ? '【为什么加的是“一次项系数一半的平方”？】对比 $u^2 + 2ku + k^2 = (u + k)^2$ 与 $u^2 + b u$：交叉项 $2k = b \\implies k = \\frac{b}{2}$。为了凑成完全平方式，常数项必须补全 $k^2 = (b/2)^2$！根据等式守恒性质，右边也必须加上相同的数值。'
      : '[Why add (b/2)²?] Comparing u² + bu with (u + k)² = u² + 2ku + k², the cross-term demands 2k = b, which forces k = b/2. Thus the missing constant to close the square is exactly (b/2)².',
    highlight: true
  });

  // Step 5: 完全平方式收拢
  const rhsCombinedConst = dOverA + addConst;
  const quadShift = -halfB;

  let step5Math = `${formatShiftTerm(quadVar, quadShift)}^2 = `;
  step5Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(rhsCombinedConst)}`;

  steps.push({
    title: lang === 'zh' ? '第五步：左边化完全平方式，右边合并常数项' : 'Step 5: Factor Perfect Square & Combine Constants',
    math: step5Math,
    note: lang === 'zh'
      ? `左边利用完全平方公式收拢为 $${formatShiftTerm(quadVar, quadShift)}^2$；右边合并常数项得 $${formatFractionLaTeX(rhsCombinedConst)}$。`
      : `Left side contracts to $${formatShiftTerm(quadVar, quadShift)}^2$; right side combines constants to $${formatFractionLaTeX(rhsCombinedConst)}$.`,
    whyExplanation: lang === 'zh'
      ? '【完全平方的几何意义】完全平方式 $(u - k)^2$ 表示变量 $u$ 偏离其对称轴基准线 $u = k$ 的相对位移，是确定抛物线顶点坐标的基石。'
      : '[Geometric meaning] The factor (u - k)² represents displacement from the vertex axis u = k.'
  });

  // Step 6: 提取一次项系数，化为顶点标准式
  const linShift = -rhsCombinedConst / cOverA;

  let step6Math = `${formatShiftTerm(quadVar, quadShift)}^2 = `;
  if (cOverA === 1) step6Math += `${formatShiftTerm(linVar, linShift)}`;
  else if (cOverA === -1) step6Math += `-${formatShiftTerm(linVar, linShift)}`;
  else step6Math += `${formatFractionLaTeX(cOverA)} ${formatShiftTerm(linVar, linShift)}`;

  steps.push({
    title: lang === 'zh' ? '第六步：提取一次项系数，化为顶点标准式' : 'Step 6: Factor Out Linear Coefficient (Standard Form)',
    math: step6Math,
    note: lang === 'zh'
      ? `提取一次项系数 $${formatFractionLaTeX(cOverA)}$，直接读出顶点坐标与焦参数。`
      : `Factor out $${formatFractionLaTeX(cOverA)}$ to reveal the vertex coordinates and focal width.`,
    whyExplanation: lang === 'zh'
      ? '【为什么必须在括号内让一次变量系数为 1？】标准方程 $(u - k)^2 = 2p(v - h)$ 要求括号内必须是 $(v - h)$。只有把系数提取到括号外，才能准确读出顶点坐标 $h$ 与真实的焦弦通径长 $2p$。'
      : '[Why factor out the coefficient?] Standard form requires (v - h) with unit coefficient inside the parentheses so that h directly represents the vertex coordinate.'
  });

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
  steps.push({
    title: lang === 'zh' ? '第七步：提取焦参数 p 与半距 p/2' : 'Step 7: Extract Parameter p and Semi-Distance p/2',
    math: `2p = |${formatFractionLaTeX(cOverA)}| = ${formatFractionLaTeX(twoP)} \\implies p = ${formatFractionLaTeX(p)}, \\quad \\frac{p}{2} = ${formatFractionLaTeX(halfP)}`,
    note: lang === 'zh'
      ? `一次项系数绝对值等于通径长 $2p = ${formatFractionLaTeX(twoP)}$，从而 $p = ${formatFractionLaTeX(p)}$。顶点到焦点与准线的距离各为 $\\frac{p}{2} = ${formatFractionLaTeX(halfP)}$。`
      : `Coefficient magnitude is $2p = ${formatFractionLaTeX(twoP)}$, so $p = ${formatFractionLaTeX(p)}$. The vertex-to-focus distance is $p/2 = ${formatFractionLaTeX(halfP)}$.`,
    whyExplanation: lang === 'zh'
      ? '【为什么到顶点的距离是 p/2 而不是 p？】焦参数 $p$ 是焦点到准线的“全长距离”。因为顶点处于焦点与准线的对称中点，中点平分线段，所以顶点到两边的距离各占一半，即 $p/2$！这是解析几何考试丢分最多的陷阱。'
      : '[Why is distance to vertex p/2 and not p?] The parameter p is the total distance between Focus and Directrix line. Because the vertex sits precisely at the midpoint, the distance from vertex to either is half: p/2.'
  });

  let focusX = h, focusY = k, directrixVal = 0, directrixType: 'x' | 'y' = 'x', axisVal = 0, axisType: 'x' | 'y' = 'y';
  if (direction === 'right') {
    focusX = h + halfP;
    directrixType = 'x';
    directrixVal = h - halfP;
    axisType = 'y';
    axisVal = k;
  } else if (direction === 'left') {
    focusX = h - halfP;
    directrixType = 'x';
    directrixVal = h + halfP;
    axisType = 'y';
    axisVal = k;
  } else if (direction === 'up') {
    focusY = k + halfP;
    directrixType = 'y';
    directrixVal = k - halfP;
    axisType = 'x';
    axisVal = h;
  } else {
    focusY = k - halfP;
    directrixType = 'y';
    directrixVal = k + halfP;
    axisType = 'x';
    axisVal = h;
  }

  const directrixLatex = `${directrixType} = ${formatFractionLaTeX(directrixVal)}`;
  const axisLatex = `${axisType} = ${formatFractionLaTeX(axisVal)}`;

  steps.push({
    title: lang === 'zh' ? '第八步：确定焦点坐标与准线方程' : 'Step 8: Compute Focus Coordinates & Directrix Equation',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '顶点' : 'Vertex'} } V &: \\left(${formatFractionLaTeX(h)},\\ ${formatFractionLaTeX(k)}\\right) \\\\[6pt]
      \\text{${lang === 'zh' ? '焦点' : 'Focus'} } F &: \\left(${formatFractionLaTeX(focusX)},\\ ${formatFractionLaTeX(focusY)}\\right) \\\\[6pt]
      \\text{${lang === 'zh' ? '准线方程' : 'Directrix'} } &: ${directrixLatex} \\\\[6pt]
      \\text{${lang === 'zh' ? '对称轴' : 'Axis'} } &: ${axisLatex}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `顶点为基准点。焦点在抛物线凹侧内部（偏移 $+p/2$），准线在凸侧背部（偏移 $-p/2$）。准线必须书写为直线方程形式。`
      : `Vertex is the origin base. Focus is inside the curve (+p/2), and directrix is outside behind the vertex (-p/2).`,
    whyExplanation: lang === 'zh'
      ? '【为什么开口方向由一次项系数正负决定？】“一次定轴，符号定方”。因为平方项永远 $\\ge 0$，所以一次项 $(v - h)$ 的符号必须与外围系数相同才能保证乘积非负，因此图像只能向系数的正/负半轴延伸。'
      : '[Why does the sign govern opening direction?] Because a squared term (u - k)² is always non-negative (≥ 0), the linear factor must share the same sign as the outer coefficient. Thus the parabola can only extend in that direction.'
  });

  // Domain & Range
  let domainLatex = '', rangeLatex = '';
  if (orientation === 'horizontal') {
    rangeLatex = '(-\\infty, \\infty)';
    domainLatex = direction === 'right' ? `[${formatFractionLaTeX(h)}, \\infty)` : `(-\\infty, ${formatFractionLaTeX(h)}]`;
  } else {
    domainLatex = '(-\\infty, \\infty)';
    rangeLatex = direction === 'up' ? `[${formatFractionLaTeX(k)}, \\infty)` : `(-\\infty, ${formatFractionLaTeX(k)}]`;
  }

  return {
    conicType: 'parabola',
    centerOrVertex: { x: h, y: k, xFrac: toFraction(h), yFrac: toFraction(k), label: 'V' },
    foci: [{ x: focusX, y: focusY, xFrac: toFraction(focusX), yFrac: toFraction(focusY), label: 'F' }],
    vertices: [{ x: h, y: k, xFrac: toFraction(h), yFrac: toFraction(k), label: 'V' }],
    directrices: [{ type: directrixType, val: directrixVal, latex: directrixLatex }],
    axesOfSymmetry: [{ type: axisType, val: axisVal, latex: axisLatex, label: lang === 'zh' ? '对称轴' : 'Axis' }],
    eccentricity: { val: 1, latex: 'e = 1' },
    latusRectum: { val: twoP, latex: `2p = ${formatFractionLaTeX(twoP)}` },
    standardLatex: step6Math,
    parameters: { p, halfP, orientation, direction },
    domainLatex,
    rangeLatex,
    steps
  };
}

/**
 * Solve Ellipse:
 * Ax^2 + By^2 + Cx + Dy + E = 0  (A > 0, B > 0, A != B)
 */
export function solveEllipse(
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
  lang: Language = 'en'
): ConicAnalysisResult {
  if (A <= 0 || B <= 0) {
    throw new Error(lang === 'zh' ? '椭圆方程的二次项系数 A 与 B 必须同号且为正' : 'Ellipse coefficients A and B must be positive.');
  }

  const steps: StepExplanation[] = [];

  // Step 1: 原方程
  let origEq = `${A === 1 ? '' : formatFractionLaTeX(A)}x^2 + ${B === 1 ? '' : formatFractionLaTeX(B)}y^2`;
  origEq += formatSignedTermLaTeX(C, 'x');
  origEq += formatSignedTermLaTeX(D, 'y');
  origEq += formatSignedTermLaTeX(E);
  origEq += ' = 0';

  steps.push({
    title: lang === 'zh' ? '第一步：分析方程结构与椭圆判别' : 'Step 1: Check Conic Discriminant for Ellipse',
    math: origEq,
    note: lang === 'zh'
      ? `二次项系数 $A = ${formatFractionLaTeX(A)}, B = ${formatFractionLaTeX(B)}$ 均大于 0 且同号。根据圆锥曲线判别法则，此方程为椭圆的一般方程。`
      : `Both squared coefficients A = ${A} and B = ${B} are positive and share the same sign. This represents an ellipse.`,
    whyExplanation: lang === 'zh'
      ? '【椭圆与双曲线的根本区别】当 $x^2$ 与 $y^2$ 系数同号正数时，曲线在平面上必须同时在 $x$ 与 $y$ 方向受限封闭，因而构成椭圆。若一正一负，则延伸至无穷远构成双曲线。'
      : '[Why ellipse?] When both quadratic terms are positive, the level curves form bounded, closed ovals in Euclidean space.'
  });

  // Step 2: 移项分拣与提取公因式
  // A(x^2 + C/A x) + B(y^2 + D/B y) = -E
  const cOverA = C / A;
  const dOverB = D / B;
  const rhs1 = -E;

  let step2Math = `${formatFractionLaTeX(A)}\\left(x^2 ${formatSignedTermLaTeX(cOverA, 'x')}\\right) + `;
  step2Math += `${formatFractionLaTeX(B)}\\left(y^2 ${formatSignedTermLaTeX(dOverB, 'y')}\\right) = ${formatFractionLaTeX(rhs1)}`;

  steps.push({
    title: lang === 'zh' ? '第二步：分组提取二次项系数' : 'Step 2: Group Terms & Factor Out Leading Coefficients',
    math: step2Math,
    note: lang === 'zh'
      ? `将含 $x$ 的项提取公因数 $A = ${formatFractionLaTeX(A)}$，含 $y$ 的项提取公因数 $B = ${formatFractionLaTeX(B)}$，常数项移到右边。`
      : `Factor out $A$ from x-terms and $B$ from y-terms. Move constant $E$ to the right.`,
    whyExplanation: lang === 'zh'
      ? '【为什么必须先提取外层系数？】配方法必须在括号内部让二次项系数为 1，才能准确补齐 $(b/2)^2$。'
      : '[Why factor out A and B first?] To ensure each inner polynomial has a unit coefficient on the squared variable.'
  });

  // Step 3: 核心配方（分别加常数）
  const halfC = cOverA / 2;
  const addX = halfC * halfC; // added inside x bracket
  const halfD = dOverB / 2;
  const addY = halfD * halfD; // added inside y bracket

  // Total added to RHS: A * addX + B * addY
  const addedRHS = A * addX + B * addY;
  const rhsTotal = rhs1 + addedRHS;

  let step3Math = `${formatFractionLaTeX(A)}\\left(x^2 ${formatSignedTermLaTeX(cOverA, 'x')} + ${formatFractionLaTeX(addX)}\\right) + `;
  step3Math += `${formatFractionLaTeX(B)}\\left(y^2 ${formatSignedTermLaTeX(dOverB, 'y')} + ${formatFractionLaTeX(addY)}\\right) = `;
  step3Math += `${formatFractionLaTeX(rhs1)} + ${formatFractionLaTeX(A)}\\times${formatFractionLaTeX(addX)} + ${formatFractionLaTeX(B)}\\times${formatFractionLaTeX(addY)} = ${formatFractionLaTeX(rhsTotal)}`;

  steps.push({
    title: lang === 'zh' ? '第三步：双变量独立配方（核心避坑）' : 'Step 3: Complete Squares on Both Variables',
    math: step3Math,
    note: lang === 'zh'
      ? `$x$ 括号内补上 $\\left(\\frac{${formatFractionLaTeX(cOverA)}}{2}\\right)^2 = ${formatFractionLaTeX(addX)}$；$y$ 括号内补上 $\\left(\\frac{${formatFractionLaTeX(dOverB)}}{2}\\right)^2 = ${formatFractionLaTeX(addY)}$。等式右边必须对应加上 $A \\times ${formatFractionLaTeX(addX)} + B \\times ${formatFractionLaTeX(addY)} = ${formatFractionLaTeX(addedRHS)}$！`
      : `Add $(C/2A)^2 = ${formatFractionLaTeX(addX)}$ inside x, and $(D/2B)^2 = ${formatFractionLaTeX(addY)}$ inside y. The RHS must add $A(${formatFractionLaTeX(addX)}) + B(${formatFractionLaTeX(addY)}) = ${formatFractionLaTeX(addedRHS)}$.`,
    whyExplanation: lang === 'zh'
      ? '【高频失分警示：右边为什么不能只加 addX 和 addY？】因为左边加在括号内的常数被外面的因数 $A$ 和 $B$ 乘过了！左边实际增加的净数值是 $A \\cdot (\\Delta x) + B \\cdot (\\Delta y)$。若右边忘了乘外围系数，整个方程将被彻底算错！'
      : '[Common Exam Pitfall] The constant inside the parentheses is multiplied by the outer coefficient. To maintain equation balance, the RHS must be augmented by A·(addX) + B·(addY).'
  });

  if (rhsTotal <= 0) {
    throw new Error(lang === 'zh' ? '配方后右边常数 ≤ 0，无法构成实椭圆' : 'RHS ≤ 0 after completing the square; degenerates or has no real points.');
  }

  // Step 4: 收拢完全平方并归一化为 1
  const h = -halfC;
  const k = -halfD;

  const aSq = rhsTotal / A;
  const bSq = rhsTotal / B;

  let step4Math = `${formatFractionLaTeX(A)}${formatShiftTerm('x', h)}^2 + ${formatFractionLaTeX(B)}${formatShiftTerm('y', k)}^2 = ${formatFractionLaTeX(rhsTotal)}`;
  let step5Math = `\\frac{${formatShiftTerm('x', h)}^2}{${formatFractionLaTeX(aSq)}} + \\frac{${formatShiftTerm('y', k)}^2}{${formatFractionLaTeX(bSq)}} = 1`;

  steps.push({
    title: lang === 'zh' ? '第四步：收拢完全平方与两边同除以右端项' : 'Step 4: Contract Squares & Divide by RHS to Equate to 1',
    math: `${step4Math} \\\\[6pt] \\implies ${step5Math}`,
    note: lang === 'zh'
      ? `两边同时除以常数 $${formatFractionLaTeX(rhsTotal)}$，使方程右端严格等于 1，化为标准椭圆方程。`
      : `Divide by ${formatFractionLaTeX(rhsTotal)} so the right-hand side is normalized to 1.`,
    whyExplanation: lang === 'zh'
      ? '【为什么必须化右端为 1？】椭圆几何标准定义要求右端为 1，此时分母直接等于半轴长平方 $a^2$ 与 $b^2$。'
      : '[Why normalize RHS to 1?] Standard ellipse canonical form requires RHS = 1 so that the denominators directly represent the squares of semi-axes a² and b².'
  });

  // Determine major axis
  const isHorizMajor = aSq >= bSq;
  const majorSq = isHorizMajor ? aSq : bSq;
  const minorSq = isHorizMajor ? bSq : aSq;

  const semiA = Math.sqrt(majorSq);
  const semiB = Math.sqrt(minorSq);
  const cSq = majorSq - minorSq;
  const semiC = Math.sqrt(cSq);
  const ecc = semiC / semiA;

  let f1X = h, f1Y = k, f2X = h, f2Y = k;
  let v1X = h, v1Y = k, v2X = h, v2Y = k;
  let d1Val = 0, d2Val = 0;
  let directrixType: 'x' | 'y' = 'x';

  if (isHorizMajor) {
    f1X = h - semiC;
    f2X = h + semiC;
    v1X = h - semiA;
    v2X = h + semiA;
    directrixType = 'x';
    d1Val = h - (majorSq / semiC);
    d2Val = h + (majorSq / semiC);
  } else {
    f1Y = k - semiC;
    f2Y = k + semiC;
    v1Y = k - semiB;
    v2Y = k + semiB;
    directrixType = 'y';
    d1Val = k - (majorSq / semiC);
    d2Val = k + (majorSq / semiC);
  }

  const latusRectum = (2 * minorSq) / semiA;

  steps.push({
    title: lang === 'zh' ? '第五步：解出几何核心量 a, b, c 与焦点坐标' : 'Step 5: Calculate Semi-Axes a, b, c and Foci',
    math: `\\begin{aligned}
      a^2 &= ${formatFractionLaTeX(majorSq)} \\implies a = ${semiA.toFixed(3).replace(/\\.000$/, '')} \\\\[4pt]
      b^2 &= ${formatFractionLaTeX(minorSq)} \\implies b = ${semiB.toFixed(3).replace(/\\.000$/, '')} \\\\[4pt]
      c^2 &= a^2 - b^2 = ${formatFractionLaTeX(cSq)} \\implies c = ${semiC.toFixed(3).replace(/\\.000$/, '')} \\\\[6pt]
      \\text{${lang === 'zh' ? '离心率' : 'Eccentricity'}} &: e = \\frac{c}{a} = ${ecc.toFixed(4)} < 1
    \\end{aligned}`,
    note: lang === 'zh'
      ? `分母较大者对应长轴所在方向（${isHorizMajor ? '长轴平行于 x 轴' : '长轴平行于 y 轴'}）。焦点坐标在长轴两端对称分布。`
      : `The larger denominator dictates the major axis (${isHorizMajor ? 'Horizontal' : 'Vertical'}).`,
    whyExplanation: lang === 'zh'
      ? '【椭圆焦点关系为什么是 a² - b²？】根据椭圆第一定义 $|PF_1| + |PF_2| = 2a$。当点取在短轴端点时，构筑直角三角形，斜边为 $a$，两直角边分别为 $b$ 与 $c$，因此严格满足勾股定理 $b^2 + c^2 = a^2 \\implies c^2 = a^2 - b^2$。'
      : '[Why c² = a² - b² in an ellipse?] By definition, the sum of distances is 2a. At the co-vertex, the distances form right triangles with legs b and c and hypotenuse a, yielding b² + c² = a².'
  });

  return {
    conicType: 'ellipse',
    centerOrVertex: { x: h, y: k, xFrac: toFraction(h), yFrac: toFraction(k), label: 'O' },
    foci: [
      { x: f1X, y: f1Y, xFrac: toFraction(f1X), yFrac: toFraction(f1Y), label: 'F_1' },
      { x: f2X, y: f2Y, xFrac: toFraction(f2X), yFrac: toFraction(f2Y), label: 'F_2' }
    ],
    vertices: [
      { x: v1X, y: v1Y, xFrac: toFraction(v1X), yFrac: toFraction(v1Y), label: 'A_1' },
      { x: v2X, y: v2Y, xFrac: toFraction(v2X), yFrac: toFraction(v2Y), label: 'A_2' }
    ],
    directrices: [
      { type: directrixType, val: d1Val, latex: `${directrixType} = ${formatFractionLaTeX(d1Val)}` },
      { type: directrixType, val: d2Val, latex: `${directrixType} = ${formatFractionLaTeX(d2Val)}` }
    ],
    axesOfSymmetry: [
      { type: 'y', val: k, latex: `y = ${formatFractionLaTeX(k)}`, label: lang === 'zh' ? '主对称轴' : 'Major Axis' },
      { type: 'x', val: h, latex: `x = ${formatFractionLaTeX(h)}`, label: lang === 'zh' ? '副对称轴' : 'Minor Axis' }
    ],
    eccentricity: { val: ecc, latex: `e = ${ecc.toFixed(4)}` },
    latusRectum: { val: latusRectum, latex: `\\frac{2b^2}{a} = ${formatFractionLaTeX(latusRectum)}` },
    standardLatex: step5Math,
    parameters: { a: semiA, b: semiB, c: semiC, orientation: isHorizMajor ? 'horizontal' : 'vertical' },
    domainLatex: `[${formatFractionLaTeX(h - (isHorizMajor ? semiA : semiB))}, ${formatFractionLaTeX(h + (isHorizMajor ? semiA : semiB))}]`,
    rangeLatex: `[${formatFractionLaTeX(k - (isHorizMajor ? semiB : semiA))}, ${formatFractionLaTeX(k + (isHorizMajor ? semiB : semiA))}]`,
    steps
  };
}

/**
 * Solve Hyperbola:
 * Ax^2 - By^2 + Cx + Dy + E = 0 (horizontal transverse axis)
 * or -Ax^2 + By^2 + Cx + Dy + E = 0 (vertical transverse axis)
 */
export function solveHyperbola(
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
  lang: Language = 'en'
): ConicAnalysisResult {
  // A and B have opposite signs
  if (A * B >= 0) {
    throw new Error(lang === 'zh' ? '双曲线方程的二次项系数 A 与 B 必须异号' : 'Hyperbola quadratic coefficients A and B must have opposite signs.');
  }

  const steps: StepExplanation[] = [];
  const isXPositive = A > 0;

  // Let positive coeff be posCoeff, negative be negCoeff
  const posA = Math.abs(A);
  const posB = Math.abs(B);

  // Group terms
  // If A > 0 and B < 0: A(x^2 + C/A x) - |B|(y^2 - D/|B| y) = -E
  const cOverA = C / A;
  const dOverB = D / B;
  const rhs1 = -E;

  const halfX = cOverA / 2;
  const addX = halfX * halfX;
  const halfY = dOverB / 2;
  const addY = halfY * halfY;

  // Added to RHS: A * addX + B * addY (note B is negative!)
  const addedRHS = A * addX + B * addY;
  const rhsTotal = rhs1 + addedRHS;

  const h = -halfX;
  const k = -halfY;

  let origEq = `${A === 1 ? '' : A === -1 ? '-' : formatFractionLaTeX(A)}x^2 ${formatSignedTermLaTeX(B, 'y^2')}`;
  origEq += formatSignedTermLaTeX(C, 'x');
  origEq += formatSignedTermLaTeX(D, 'y');
  origEq += formatSignedTermLaTeX(E);
  origEq += ' = 0';

  steps.push({
    title: lang === 'zh' ? '第一步：分析方程类型与双曲线判别' : 'Step 1: Check Hyperbola Discriminant',
    math: origEq,
    note: lang === 'zh'
      ? `二次项系数 $A = ${formatFractionLaTeX(A)}, B = ${formatFractionLaTeX(B)}$ 异号（$A \\cdot B < 0$）。根据圆锥曲线定理，此方程为双曲线。`
      : `Quadratic coefficients have opposite signs ($A \\cdot B < 0$), identifying this conic as a hyperbola.`,
    whyExplanation: lang === 'zh'
      ? '【为什么系数异号是双曲线？】减号意味着曲线无法闭合，随着变量趋于无穷，曲线两翼无限逼近渐近线，构成两支不相连的开放双曲线。'
      : '[Why hyperbola?] The subtraction term allows variables to grow unboundedly toward asymptotes, forming two open branches.'
  });

  // Step 2 & 3: 配方步骤
  let step3Math = `${formatFractionLaTeX(A)}\\left(x ${formatSignedTermLaTeX(-h)}\\right)^2 + ${formatFractionLaTeX(B)}\\left(y ${formatSignedTermLaTeX(-k)}\\right)^2 = ${formatFractionLaTeX(rhsTotal)}`;

  // Divide by rhsTotal
  const termXDenom = rhsTotal / A;
  const termYDenom = rhsTotal / B;

  // One of termXDenom or termYDenom will be positive, the other negative
  const xIsTransverse = termXDenom > 0;
  const aSq = Math.abs(xIsTransverse ? termXDenom : termYDenom);
  const bSq = Math.abs(xIsTransverse ? termYDenom : termXDenom);

  let step4Math = '';
  if (xIsTransverse) {
    step4Math = `\\frac{${formatShiftTerm('x', h)}^2}{${formatFractionLaTeX(aSq)}} - \\frac{${formatShiftTerm('y', k)}^2}{${formatFractionLaTeX(bSq)}} = 1`;
  } else {
    step4Math = `\\frac{${formatShiftTerm('y', k)}^2}{${formatFractionLaTeX(aSq)}} - \\frac{${formatShiftTerm('x', h)}^2}{${formatFractionLaTeX(bSq)}} = 1`;
  }

  steps.push({
    title: lang === 'zh' ? '第二步：配方与化为标准双曲线方程' : 'Step 2: Complete the Squares & Normalize RHS to 1',
    math: `${step3Math} \\\\[6pt] \\implies ${step4Math}`,
    note: lang === 'zh'
      ? `配方后两边除以 $${formatFractionLaTeX(rhsTotal)}$，正号项所在变量为实轴（${xIsTransverse ? '实轴沿 x 轴水平张开' : '实轴沿 y 轴竖直张开'}）。`
      : `Dividing by ${formatFractionLaTeX(rhsTotal)} normalizes the equation. The positive term indicates the transverse axis.`,
    whyExplanation: lang === 'zh'
      ? '【配方法负号提取陷阱】提取负号时，括号内部一次项符号必须反号！例如 $-3(y^2 - 4y)$，里面必须补 $+4$ 才能构成完全平方式，右边必须减去 $3 \\times 4 = 12$。'
      : '[Sign Trap] When factoring out a negative coefficient, flip the inner sign. Remember that the constant added inside will subtract from the RHS.'
  });

  const semiA = Math.sqrt(aSq);
  const semiB = Math.sqrt(bSq);
  const cSq = aSq + bSq;
  const semiC = Math.sqrt(cSq);
  const ecc = semiC / semiA;

  let f1X = h, f1Y = k, f2X = h, f2Y = k;
  let v1X = h, v1Y = k, v2X = h, v2Y = k;

  if (xIsTransverse) {
    f1X = h - semiC;
    f2X = h + semiC;
    v1X = h - semiA;
    v2X = h + semiA;
  } else {
    f1Y = k - semiC;
    f2Y = k + semiC;
    v1Y = k - semiA;
    v2Y = k + semiA;
  }

  // Asymptotes
  const slope = semiB / semiA;
  const asymp1 = xIsTransverse
    ? `y ${formatSignedTermLaTeX(-k)} = \\frac{${formatFractionLaTeX(semiB)}}{${formatFractionLaTeX(semiA)}}\\left(x ${formatSignedTermLaTeX(-h)}\\right)`
    : `y ${formatSignedTermLaTeX(-k)} = \\frac{${formatFractionLaTeX(semiA)}}{${formatFractionLaTeX(semiB)}}\\left(x ${formatSignedTermLaTeX(-h)}\\right)`;

  const asymp2 = xIsTransverse
    ? `y ${formatSignedTermLaTeX(-k)} = -\\frac{${formatFractionLaTeX(semiB)}}{${formatFractionLaTeX(semiA)}}\\left(x ${formatSignedTermLaTeX(-h)}\\right)`
    : `y ${formatSignedTermLaTeX(-k)} = -\\frac{${formatFractionLaTeX(semiA)}}{${formatFractionLaTeX(semiB)}}\\left(x ${formatSignedTermLaTeX(-h)}\\right)`;

  steps.push({
    title: lang === 'zh' ? '第三步：求焦点、离心率与渐近线方程' : 'Step 3: Calculate Foci, Eccentricity & Asymptotes',
    math: `\\begin{aligned}
      c^2 &= a^2 + b^2 = ${formatFractionLaTeX(cSq)} \\implies c = ${semiC.toFixed(3).replace(/\\.000$/, '')} \\\\[4pt]
      \\text{${lang === 'zh' ? '离心率' : 'Eccentricity'}} &: e = \\frac{c}{a} = ${ecc.toFixed(4)} > 1 \\\\[4pt]
      \\text{${lang === 'zh' ? '渐近线方程' : 'Asymptotes'}} &: ${asymp1}, \\quad ${asymp2}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `双曲线满足 $c^2 = a^2 + b^2$。渐近线求法秘诀：将标准方程右端的 1 替换为 0，直接因式分解即可得出！`
      : `In hyperbola, $c^2 = a^2 + b^2$ and $e > 1$. Replacing 1 with 0 gives the asymptotes.`,
    whyExplanation: lang === 'zh'
      ? '【渐近线秒杀技巧原理】当 $x, y \\to \\infty$ 时，常数 1 与巨大的变量平方相比趋于 0，因此曲线极限无限趋近于将 1 换为 0 后的两条相交直线。'
      : '[Asymptote principle] At infinity, the constant 1 is negligible compared to the squared variables. Setting RHS = 0 immediately reveals the two limiting lines.'
  });

  const latusRectum = (2 * bSq) / semiA;

  return {
    conicType: 'hyperbola',
    centerOrVertex: { x: h, y: k, xFrac: toFraction(h), yFrac: toFraction(k), label: 'O' },
    foci: [
      { x: f1X, y: f1Y, xFrac: toFraction(f1X), yFrac: toFraction(f1Y), label: 'F_1' },
      { x: f2X, y: f2Y, xFrac: toFraction(f2X), yFrac: toFraction(f2Y), label: 'F_2' }
    ],
    vertices: [
      { x: v1X, y: v1Y, xFrac: toFraction(v1X), yFrac: toFraction(v1Y), label: 'A_1' },
      { x: v2X, y: v2Y, xFrac: toFraction(v2X), yFrac: toFraction(v2Y), label: 'A_2' }
    ],
    directrices: [
      { type: xIsTransverse ? 'x' : 'y', val: (xIsTransverse ? h : k) - (aSq / semiC), latex: `${xIsTransverse ? 'x' : 'y'} = ${formatFractionLaTeX((xIsTransverse ? h : k) - (aSq / semiC))}` },
      { type: xIsTransverse ? 'x' : 'y', val: (xIsTransverse ? h : k) + (aSq / semiC), latex: `${xIsTransverse ? 'x' : 'y'} = ${formatFractionLaTeX((xIsTransverse ? h : k) + (aSq / semiC))}` }
    ],
    axesOfSymmetry: [
      { type: 'y', val: k, latex: `y = ${formatFractionLaTeX(k)}`, label: lang === 'zh' ? '实轴' : 'Transverse Axis' },
      { type: 'x', val: h, latex: `x = ${formatFractionLaTeX(h)}`, label: lang === 'zh' ? '虚轴' : 'Conjugate Axis' }
    ],
    asymptotes: [{ latex: asymp1 }, { latex: asymp2 }],
    eccentricity: { val: ecc, latex: `e = ${ecc.toFixed(4)}` },
    latusRectum: { val: latusRectum, latex: `\\frac{2b^2}{a} = ${formatFractionLaTeX(latusRectum)}` },
    standardLatex: step4Math,
    parameters: { a: semiA, b: semiB, c: semiC, orientation: xIsTransverse ? 'horizontal' : 'vertical' },
    domainLatex: xIsTransverse ? `(-\\infty, ${formatFractionLaTeX(h - semiA)}] \\cup [${formatFractionLaTeX(h + semiA)}, \\infty)` : '(-\\infty, \\infty)',
    rangeLatex: xIsTransverse ? '(-\\infty, \\infty)' : `(-\\infty, ${formatFractionLaTeX(k - semiA)}] \\cup [${formatFractionLaTeX(k + semiA)}, \\infty)`,
    steps
  };
}
