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
 *
 * Provides comprehensive, hyper-detailed step-by-step breakdown
 * of general form to standard form transformation (一般式转标准式全流程).
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

  // Step 1: 原方程分析与各项系数定位
  steps.push({
    title: lang === 'zh' ? '第一步：分析方程类型与提取各项系数' : 'Step 1: Analyze Equation & Extract Coefficients',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '原一般方程' : 'Original Equation'}} &: ${origEq} \\\\[4pt]
      \\text{${lang === 'zh' ? '二次变量' : 'Quadratic Variable'}} &: ${quadVar} \\quad (\\text{${lang === 'zh' ? '系数' : 'Coeff'}} A = ${formatFractionLaTeX(A)}) \\\\[4pt]
      \\text{${lang === 'zh' ? '同侧一次项系数' : 'Linear Coeff'}} &: B = ${formatFractionLaTeX(B)} \\\\[4pt]
      \\text{${lang === 'zh' ? '对侧一次变量' : 'Opposite Variable'}} &: ${linVar} \\quad (\\text{${lang === 'zh' ? '系数' : 'Coeff'}} C = ${formatFractionLaTeX(C)}) \\\\[4pt]
      \\text{${lang === 'zh' ? '常数项' : 'Constant'}} &: D = ${formatFractionLaTeX(D)}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `方程中只有单一变量 $${quadVar}$ 含有二次方，而变量 $${linVar}$ 为一次方。根据解析几何圆锥曲线分类定理，方程严格表示抛物线，其对称轴平行于 $${linVar}$ 轴（${orientation === 'horizontal' ? '水平轴向，左右开口' : '竖直轴向，上下开口'}）。`
      : `Only $${quadVar}$ has degree 2, while $${linVar}$ is linear. This uniquely characterizes a parabola whose axis is parallel to the $${linVar}$-axis.`,
    whyExplanation: lang === 'zh'
      ? '【为什么只有抛物线单二次项？】圆锥曲线一般方程 $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$ 中，判别式 $\\Delta = B^2 - 4AC$。当且仅当一个变量为二次而另一个为一次时，离心率 $e = 1$，曲线只向一个方向单侧无限延伸，必为抛物线。'
      : '[Why exactly one squared variable?] A parabola is the unique conic with eccentricity e = 1, possessing a single axis of symmetry and extending unboundedly in one direction.'
  });

  // Step 2: 移项分拣
  const rhsLinCoeff = -C;
  const rhsConst = -D;

  let step2Lhs = '';
  if (A === 1) step2Lhs += `${quadVar}^2`;
  else if (A === -1) step2Lhs += `-${quadVar}^2`;
  else step2Lhs += `${formatFractionLaTeX(A)}${quadVar}^2`;
  step2Lhs += formatSignedTermLaTeX(B, quadVar);

  const step2Rhs = `${formatSignedTermLaTeX(rhsLinCoeff, linVar).trim() || '0'}${formatSignedTermLaTeX(rhsConst)}`;

  steps.push({
    title: lang === 'zh' ? '第二步：移项分拣（变量隔离与跨等号变号）' : 'Step 2: Isolate Squared Variable on Left-Hand Side',
    math: `${step2Lhs} = ${step2Rhs}`,
    note: lang === 'zh'
      ? `遵循“主变量留左、次变量移右”原则：把含二次变量 $${quadVar}$ 的项保留在等号左侧；将含有一次变量 $${linVar}$ 的项与常数项移到右侧，注意符号反转（$+(${formatFractionLaTeX(C)})$ 变为 $${formatFractionLaTeX(rhsLinCoeff)}$，$+(${formatFractionLaTeX(D)})$ 变为 $${formatFractionLaTeX(rhsConst)}$）。`
      : `Group all $${quadVar}$ terms on the left. Transpose $${linVar}$ and constants to the right, reversing their signs.`,
    whyExplanation: lang === 'zh'
      ? '【为什么必须将二次与一次变量分别置于等号两侧？】标准顶点式为 $(u - k)^2 = 2p(v - h)$。左侧是纯净的完全平方式，右侧是一次项因式。提前隔离避免了配方过程中一次项系数被误掺入平方项中。'
      : '[Why isolate to opposite sides?] Standard vertex form puts the perfect square on the left and the factored linear term on the right.'
  });

  // Step 3: 系数归一（两边同除以二次项系数 A）
  const bOverA = B / A;
  const cOverA = rhsLinCoeff / A;
  const dOverA = rhsConst / A;

  let step3Math = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} = `;
  step3Math += `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)}`;

  if (Math.abs(A - 1) > 1e-7) {
    steps.push({
      title: lang === 'zh' ? '第三步：两边同除以二次项系数 A（首项系数归一）' : 'Step 3: Divide by Leading Coefficient A',
      math: `\\begin{aligned}
        \\frac{${step2Lhs}}{${formatFractionLaTeX(A)}} &= \\frac{${step2Rhs}}{${formatFractionLaTeX(A)}} \\\\[6pt]
        \\implies ${step3Math}
      \\end{aligned}`,
      note: lang === 'zh'
        ? `两边同时除以 $A = ${formatFractionLaTeX(A)}$，使二次项 $${quadVar}^2$ 的系数严格化为 1。此时左侧一次项系数化为 $\\frac{B}{A} = ${formatFractionLaTeX(bOverA)}$，右侧一次项系数化为 $${formatFractionLaTeX(cOverA)}$，常数项化为 $${formatFractionLaTeX(dOverA)}$。`
        : `Divide by $A = ${formatFractionLaTeX(A)}$ so the leading coefficient becomes 1, facilitating the standard square completing rule.`,
      whyExplanation: lang === 'zh'
        ? '【为什么必须将二次项系数化为 1？】配方基础公式是 $(u \\pm m)^2 = u^2 \\pm 2mu + m^2$。公式严格要求首项系数为 1。若不先除以 $A$，直接盲目加上 $(B/2)^2$ 会导致漏乘 $A^2$ 的致命错误！'
        : '[Why normalize to 1?] The canonical completing-the-square identity (u + m)² = u² + 2mu + m² assumes a unit coefficient.'
    });
  }

  // Step 4: 配方法核心拆解（拆解三部曲：一次项系数、除以2、平方）
  const halfB = bOverA / 2;
  const addConst = halfB * halfB;

  let step4Lhs = `${quadVar}^2${formatSignedTermLaTeX(bOverA, quadVar)} + \\mathbf{${formatFractionLaTeX(addConst)}}`;
  let step4Rhs = `${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(dOverA)} + \\mathbf{${formatFractionLaTeX(addConst)}}`;

  steps.push({
    title: lang === 'zh' ? '第四步：配方法核心拆解（计算配方常数并在两边同时加上）' : 'Step 4: Compute Completing-the-Square Constant & Add to Both Sides',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '左侧一次项系数' : 'Linear Coeff'}} \\ b' &= ${formatFractionLaTeX(bOverA)} \\\\[4pt]
      \\text{${lang === 'zh' ? '取其一半' : 'Half of Coeff'}} \\ \\frac{b'}{2} &= \\frac{${formatFractionLaTeX(bOverA)}}{2} = ${formatFractionLaTeX(halfB)} \\\\[4pt]
      \\text{${lang === 'zh' ? '计算其平方' : 'Square of Half'}} \\ \\left(\\frac{b'}{2}\\right)^2 &= \\left(${formatFractionLaTeX(halfB)}\\right)^2 = ${formatFractionLaTeX(addConst)} \\\\[6pt]
      \\implies ${step4Lhs} &= ${step4Rhs}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `配方法精髓：取一次项系数 $${formatFractionLaTeX(bOverA)}$ 的一半得到 $${formatFractionLaTeX(halfB)}$，再平方得到常数 $${formatFractionLaTeX(addConst)}$。根据等式基本性质，方程两边必须同时加上该数值以保持平衡！`
      : `Take half of linear coefficient ($${formatFractionLaTeX(halfB)}$) and square it ($${formatFractionLaTeX(addConst)}$). Add to both sides.`,
    whyExplanation: lang === 'zh'
      ? '【为什么加的是“一次项系数一半的平方”？】由 $(u + m)^2 = u^2 + 2mu + m^2$，交叉项 $2m = b\' \\implies m = b\'/2$。要补齐末尾常数使其成为完全平方式，所缺常数只能是 $m^2 = (b\'/2)^2$！'
      : '[Why (b/2)²?] Expanding (u + m)² produces cross-term 2mu. Equating 2m = b forces m = b/2, making m² = (b/2)² the exact missing constant.'
  });

  // Step 5: 完全平方式因式分解与右边常数合并
  const rhsCombinedConst = dOverA + addConst;
  const quadShift = -halfB;

  let step5Math = `\\left(${quadVar} ${formatSignedTermLaTeX(-quadShift)}\\right)^2 = ${formatSignedTermLaTeX(cOverA, linVar).trim() || '0'}${formatSignedTermLaTeX(rhsCombinedConst)}`;

  steps.push({
    title: lang === 'zh' ? '第五步：左边逆向收拢为完全平方式，右边通分合并常数' : 'Step 5: Factor Left Side into Perfect Square & Combine Constants',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '左侧因式分解' : 'Left Factorization'}} &: ${quadVar}^2 ${formatSignedTermLaTeX(bOverA, quadVar)} + ${formatFractionLaTeX(addConst)} = \\left(${quadVar} ${formatSignedTermLaTeX(-quadShift)}\\right)^2 \\\\[6pt]
      \\text{${lang === 'zh' ? '右侧常数合并' : 'Right Simplification'}} &: ${formatFractionLaTeX(dOverA)} + ${formatFractionLaTeX(addConst)} = ${formatFractionLaTeX(rhsCombinedConst)} \\\\[6pt]
      \\implies ${step5Math}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `左边利用完全平方公式逆向收拢为 $\\left(${quadVar} ${formatSignedTermLaTeX(-quadShift)}\\right)^2$；右边合并常数项：$${formatFractionLaTeX(dOverA)} + ${formatFractionLaTeX(addConst)} = ${formatFractionLaTeX(rhsCombinedConst)}$。`
      : `Left side contracts to $\\left(${quadVar} ${formatSignedTermLaTeX(-quadShift)}\\right)^2$. Right side constants combine into $${formatFractionLaTeX(rhsCombinedConst)}$.`,
    whyExplanation: lang === 'zh'
      ? '【完全平方因式与顶点坐标的直接对应】代数式 $(y - k)^2$ 只有在 $y = k$ 时才取得最小值 0，这正是抛物线轴线与对称中心（顶点坐标）的代数本质。'
      : '[Geometric essence] The term (y - k)² vanishes at y = k, pinpointing the vertex axis line.'
  });

  // Step 6: 提取一次项系数，化为顶点标准式
  const linShift = -rhsCombinedConst / cOverA;

  let step6Math = `${formatShiftTerm(quadVar, quadShift)}^2 = `;
  if (cOverA === 1) step6Math += `${formatShiftTerm(linVar, linShift)}`;
  else if (cOverA === -1) step6Math += `-${formatShiftTerm(linVar, linShift)}`;
  else step6Math += `${formatFractionLaTeX(cOverA)} ${formatShiftTerm(linVar, linShift)}`;

  steps.push({
    title: lang === 'zh' ? '第六步：提取右侧一次项系数，化为标准顶点方程' : 'Step 6: Factor Out Linear Coefficient to Form Standard Form',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '提取公因式' : 'Factor out'}} \\ ${formatFractionLaTeX(cOverA)} &: ${formatSignedTermLaTeX(cOverA, linVar).trim()} ${formatSignedTermLaTeX(rhsCombinedConst)} = ${formatFractionLaTeX(cOverA)}\\left(${linVar} - \\left(\\frac{-${formatFractionLaTeX(rhsCombinedConst)}}{${formatFractionLaTeX(cOverA)}}\\right)\\right) \\\\[6pt]
      \\implies ${step6Math}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `将右侧一次项系数 $${formatFractionLaTeX(cOverA)}$ 整体提取出来，使括号内变量 $${linVar}$ 的系数严格为 1，直接化为标准顶点式：$(${quadVar} - k)^2 = 2p(${linVar} - h)$。`
      : `Factor out $${formatFractionLaTeX(cOverA)}$ so that $${linVar}$ has unit coefficient inside parentheses, matching standard form $(u-k)^2 = 2p(v-h)$.`,
    whyExplanation: lang === 'zh'
      ? '【为什么括号内必须保持为 (v - h)？】如果不把系数提出来，直接读出的常数并不是真正的顶点坐标！只有当一次项形式为 $(v - h)$ 时，$h$ 才真正代表抛物线顶点的坐标。'
      : '[Why must variable have unit coefficient?] The vertex coordinate h can only be read directly when the factor inside is strictly (v - h).'
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

  // Step 7: 对应标准型参数并计算通径与焦点距
  const dirCn = direction === 'right' ? '向右 (x 轴正向)' : direction === 'left' ? '向左 (x 轴负向)' : direction === 'up' ? '向上 (y 轴正向)' : '向下 (y 轴负向)';
  const dirEn = direction === 'right' ? 'Right (+x)' : direction === 'left' ? 'Left (-x)' : direction === 'up' ? 'Up (+y)' : 'Down (-y)';

  steps.push({
    title: lang === 'zh' ? '第七步：与标准方程对照，提取顶点与焦参数' : 'Step 7: Compare with Standard Form & Extract Parameters',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '标准模板' : 'Standard Template'}} &: (${quadVar} - k)^2 = \\pm 2p(${linVar} - h) \\\\[4pt]
      \\text{${lang === 'zh' ? '顶点坐标' : 'Vertex Coordinates'}} &: V(h, k) = \\left(${formatFractionLaTeX(h)},\\ ${formatFractionLaTeX(k)}\\right) \\\\[4pt]
      \\text{${lang === 'zh' ? '通径长' : 'Latus Rectum'}} \\ 2p &= |${formatFractionLaTeX(cOverA)}| = ${formatFractionLaTeX(twoP)} \\\\[4pt]
      \\text{${lang === 'zh' ? '焦参数' : 'Focal Parameter'}} \\ p &= \\frac{2p}{2} = \\frac{${formatFractionLaTeX(twoP)}}{2} = ${formatFractionLaTeX(p)} \\\\[4pt]
      \\text{${lang === 'zh' ? '半距（顶点至焦点/准线）' : 'Half-Distance (p/2)'}} \\ \\frac{p}{2} &= \\frac{${formatFractionLaTeX(p)}}{2} = ${formatFractionLaTeX(halfP)} \\\\[4pt]
      \\text{${lang === 'zh' ? '开口方向' : 'Opening Direction'}} &: \\mathbf{${lang === 'zh' ? dirCn : dirEn}}
    \\end{aligned}`,
    note: lang === 'zh'
      ? `通径长即一次项系数的绝对值 $2p = ${formatFractionLaTeX(twoP)}$；由此解得焦参数 $p = ${formatFractionLaTeX(p)}$。顶点到焦点与准线的距离各为半步 $\\frac{p}{2} = ${formatFractionLaTeX(halfP)}$。`
      : `Latus rectum $2p = ${formatFractionLaTeX(twoP)}$, parameter $p = ${formatFractionLaTeX(p)}$, and focal distance $p/2 = ${formatFractionLaTeX(halfP)}$.`,
    whyExplanation: lang === 'zh'
      ? '【避坑警示：参数 p 与 p/2 的区别】解析几何考试中超过 40% 的错解是因为将焦参数 $p$ 误当作顶点到焦点的距离！请牢记口诀：“各距半步，相隔整步”——焦点到准线整距为 $p$，而顶点正居其中，到两边各为 $p/2$！'
      : '[Critical Exam Trap: p vs p/2] The parameter p is the distance between Focus and Directrix. The distance from vertex to focus is strictly half: p/2.'
  });

  let focusX = h, focusY = k, directrixVal = 0, directrixType: 'x' | 'y' = 'x', axisVal = 0, axisType: 'x' | 'y' = 'y';
  let l1X = h, l1Y = k, l2X = h, l2Y = k;

  if (direction === 'right') {
    focusX = h + halfP;
    directrixType = 'x';
    directrixVal = h - halfP;
    axisType = 'y';
    axisVal = k;
    l1X = focusX; l1Y = k + p;
    l2X = focusX; l2Y = k - p;
  } else if (direction === 'left') {
    focusX = h - halfP;
    directrixType = 'x';
    directrixVal = h + halfP;
    axisType = 'y';
    axisVal = k;
    l1X = focusX; l1Y = k + p;
    l2X = focusX; l2Y = k - p;
  } else if (direction === 'up') {
    focusY = k + halfP;
    directrixType = 'y';
    directrixVal = k - halfP;
    axisType = 'x';
    axisVal = h;
    l1X = h + p; l1Y = focusY;
    l2X = h - p; l2Y = focusY;
  } else {
    focusY = k - halfP;
    directrixType = 'y';
    directrixVal = k + halfP;
    axisType = 'x';
    axisVal = h;
    l1X = h + p; l1Y = focusY;
    l2X = h - p; l2Y = focusY;
  }

  const directrixLatex = `${directrixType} = ${formatFractionLaTeX(directrixVal)}`;
  const axisLatex = `${axisType} = ${formatFractionLaTeX(axisVal)}`;

  // Step 8: 焦点坐标与准线方程严格计算
  steps.push({
    title: lang === 'zh' ? '第八步：确定焦点坐标、准线方程与通径端点' : 'Step 8: Compute Focus, Directrix & Latus Endpoints',
    math: `\\begin{aligned}
      \\text{${lang === 'zh' ? '焦点' : 'Focus'}} \\ F &: \\left(${formatFractionLaTeX(focusX)},\\ ${formatFractionLaTeX(focusY)}\\right) \\\\[4pt]
      \\text{${lang === 'zh' ? '准线方程' : 'Directrix'}} \\ l &: ${directrixLatex} \\\\[4pt]
      \\text{${lang === 'zh' ? '对称轴' : 'Axis of Symmetry'}} &: ${axisLatex} \\\\[4pt]
      \\text{${lang === 'zh' ? '通径端点' : 'Latus Rectum Ends'}} &: L_1\\left(${formatFractionLaTeX(l1X)}, ${formatFractionLaTeX(l1Y)}\\right), \\ L_2\\left(${formatFractionLaTeX(l2X)}, ${formatFractionLaTeX(l2Y)}\\right)
    \\end{aligned}`,
    note: lang === 'zh'
      ? `以顶点 $V(${formatFractionLaTeX(h)}, ${formatFractionLaTeX(k)})$ 为基准：焦点向开口凹侧偏移 $\\frac{p}{2} = ${formatFractionLaTeX(halfP)}$；准线向开口背侧退后 $\\frac{p}{2}$，必须以直线方程形式书写！`
      : `Based at vertex $V$: Focus shifts inside along the axis (+p/2), and directrix line sits behind the vertex (-p/2).`,
    whyExplanation: lang === 'zh'
      ? '【解题口诀应用】“焦点在内，准线在后；各距半步，相隔整步”。准线是几何直线，填空题中必须写为完整直线方程形式（如 x = -1），只写数值 -1 会直接被扣分。'
      : '[Mnemonic] Focus is inside the curve, directrix is behind the vertex; each sits at distance p/2 from vertex.'
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
  const addX = halfC * halfC;
  const halfD = dOverB / 2;
  const addY = halfD * halfD;

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
  if (A * B >= 0) {
    throw new Error(lang === 'zh' ? '双曲线方程的二次项系数 A 与 B 必须异号' : 'Hyperbola quadratic coefficients A and B must have opposite signs.');
  }

  const steps: StepExplanation[] = [];

  const cOverA = C / A;
  const dOverB = D / B;
  const rhs1 = -E;

  const halfX = cOverA / 2;
  const addX = halfX * halfX;
  const halfY = dOverB / 2;
  const addY = halfY * halfY;

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

  let step3Math = `${formatFractionLaTeX(A)}\\left(x ${formatSignedTermLaTeX(-h)}\\right)^2 + ${formatFractionLaTeX(B)}\\left(y ${formatSignedTermLaTeX(-k)}\\right)^2 = ${formatFractionLaTeX(rhsTotal)}`;

  const termXDenom = rhsTotal / A;
  const termYDenom = rhsTotal / B;

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
