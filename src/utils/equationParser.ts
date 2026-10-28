import { ConicAnalysisResult } from './conicTypes.ts';
import { solveParabola, solveEllipse, solveHyperbola } from './conicSolver.ts';
import { Language } from '../i18n/translations.ts';

/**
 * Clean and normalize mathematical expressions from text or LaTeX
 */
export function normalizeMathString(raw: string): string {
  return raw
    .trim()
    // Unicode superscripts
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    // Unicode fractions
    .replace(/½/g, '(1/2)')
    .replace(/¼/g, '(1/4)')
    .replace(/¾/g, '(3/4)')
    // Multiplication & dots
    .replace(/×/g, '*')
    .replace(/·/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    // LaTeX wrappers & spacing
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '(')
    .replace(/\\right\]/g, ')')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    // LaTeX fractions \frac{a}{b} -> (a)/(b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Remove extra whitespace
    .replace(/\s+/g, '');
}

/**
 * Expands binomial squares (x - h)^2 or (x - h)*(x - h) -> (x^2 - 2hx + h^2)
 * and expands distribution over linear factors like 8(y + 1) -> (8y + 8).
 * Ensures NO spurious interior spaces that could break floating point parsing.
 */
export function expandAlgebraicParentheses(input: string): string {
  let s = input;

  // 1. Replace (x-h)*(x-h) or (x-h)(x-h) with (x-h)^2
  s = s.replace(/\(([^)]+)\)\s*\*?\s*\(\1\)/g, '($1)^2');

  // 2. Expand (a*x + b)^2 or (a*y + b)^2 into (c2*var^2 + c1*var + c0)
  const squarePattern = /\(([-+]?[\d./]*)\s*([xyXY])\s*([+-]\s*[\d./]+)?\)\^2/gi;
  s = s.replace(squarePattern, (_, aStr, variable, bStr) => {
    let a = 1;
    const aTrim = (aStr || '').replace(/\s+/g, '');
    if (aTrim === '-') a = -1;
    else if (aTrim === '+' || aTrim === '') a = 1;
    else if (aTrim.includes('/')) {
      const [n, d] = aTrim.split('/');
      a = parseFloat(n) / parseFloat(d);
    } else {
      a = parseFloat(aTrim);
    }

    let b = 0;
    if (bStr) {
      const bTrim = bStr.replace(/\s+/g, '');
      if (bTrim.includes('/')) {
        const [n, d] = bTrim.split('/');
        b = parseFloat(n) / parseFloat(d);
      } else {
        b = parseFloat(bTrim);
      }
    }

    if (isNaN(a)) a = 1;
    if (isNaN(b)) b = 0;

    const coeff2 = a * a;
    const coeff1 = 2 * a * b;
    const constTerm = b * b;

    const sign1 = coeff1 >= 0 ? '+' : '-';
    const absCoeff1 = Math.abs(coeff1);
    const sign2 = constTerm >= 0 ? '+' : '-';
    const absConst = Math.abs(constTerm);

    return `(${coeff2}${variable}^2${sign1}${absCoeff1}${variable}${sign2}${absConst})`;
  });

  // 3. Expand outer distribution: e.g. 8(y + 1) -> (8y+8) or -4(x - 2) -> (-4x+8)
  const distPattern = /([+-]?\s*[\d.]+)\s*\*?\s*\(\s*([xyXY])\s*([+-]\s*[\d.]+)?\s*\)/gi;
  s = s.replace(distPattern, (_, multStr, variable, bStr) => {
    const mult = parseFloat(multStr.replace(/\s+/g, ''));
    let b = 0;
    if (bStr) {
      b = parseFloat(bStr.replace(/\s+/g, ''));
    }
    if (isNaN(mult) || isNaN(b)) return _;
    const coeffVar = mult;
    const constTerm = mult * b;
    const signVar = coeffVar >= 0 ? '+' : '-';
    const signConst = constTerm >= 0 ? '+' : '-';
    return `(${signVar}${Math.abs(coeffVar)}${variable}${signConst}${Math.abs(constTerm)})`;
  });

  return s;
}

/**
 * Greatest common divisor helper
 */
function gcd(a: number, b: number): number {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

/**
 * Least common multiple helper
 */
function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 1;
  return Math.abs(Math.round(a * b)) / gcd(a, b);
}

/**
 * Direct standard vertex form matcher for Ellipse & Hyperbola:
 * Examples:
 *   (x - 1)^2 / 4 + (y + 2)^2 / 9 = 1
 *   (x - 1)^2 / 4 - (y + 2)^2 / 9 = 1
 *   (y + 2)^2 / 9 + (x - 1)^2 / 4 = 1
 *   x^2 / 4 + y^2 / 9 = 1
 *
 * Directly extracts exact h, k, denX, denY to avoid floating-point loss and double-division bugs!
 */
function tryParseStandardVertexEllipseHyperbola(
  clean: string,
  lang: Language
): ConicAnalysisResult | null {
  // Regex pattern matching:
  // (x+-h)^2/A  or  x^2/A   followed by   + or -   followed by   (y+-k)^2/B  or  y^2/B   = 1
  const vertexFracPattern = /^(\(?([xy])([+-][\d.]+)?\)?\^2|[xy]\^2)\/([\d.]+)\s*([+-])\s*(\(?([xy])([+-][\d.]+)?\)?\^2|[xy]\^2)\/([\d.]+)=1$/i;
  const match = clean.match(vertexFracPattern);
  if (!match) return null;

  const parseTerm = (termStr: string, fallbackVar: string) => {
    const sm = termStr.match(/\(?([xy])([+-][\d.]+)?\)?\^2/i);
    const variable = (sm ? sm[1] : fallbackVar).toLowerCase();
    const shift = sm && sm[2] ? parseFloat(sm[2]) : 0;
    // (x - h) -> h = -shift
    return { variable, hOrK: -shift };
  };

  const term1 = parseTerm(match[1], 'x');
  const den1 = parseFloat(match[4]);
  const op = match[5]; // '+' for ellipse, '-' for hyperbola
  const term2 = parseTerm(match[6], 'y');
  const den2 = parseFloat(match[9]);

  if (term1.variable === term2.variable) return null;
  if (isNaN(den1) || isNaN(den2) || den1 <= 0 || den2 <= 0) return null;

  const h = term1.variable === 'x' ? term1.hOrK : term2.hOrK;
  const k = term1.variable === 'y' ? term1.hOrK : term2.hOrK;
  const denX = term1.variable === 'x' ? den1 : den2;
  const denY = term1.variable === 'y' ? den1 : den2;

  // Sign associated with x and y
  // In `term1 / den1 + term2 / den2 = 1`: both are positive
  // In `term1 / den1 - term2 / den2 = 1`: term1 is positive, term2 is negative
  const signTerm1 = 1;
  const signTerm2 = op === '+' ? 1 : -1;
  const signX = term1.variable === 'x' ? signTerm1 : signTerm2;
  const signY = term1.variable === 'y' ? signTerm1 : signTerm2;

  // Clear denominators: multiply by LCM or product of denX and denY
  // (signX / denX) * (x - h)^2 + (signY / denY) * (y - k)^2 = 1
  // Multiply by (denX * denY):
  // (signX * denY) * (x - h)^2 + (signY * denX) * (y - k)^2 - (denX * denY) = 0
  const coeffX2 = signX * denY;
  const coeffY2 = signY * denX;
  const coeffX = -2 * coeffX2 * h;
  const coeffY = -2 * coeffY2 * k;
  const coeffConst = coeffX2 * h * h + coeffY2 * k * k - denX * denY;

  if (coeffX2 * coeffY2 > 0) {
    // Both positive -> Ellipse
    return solveEllipse(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
  } else {
    // Opposite signs -> Hyperbola
    return solveHyperbola(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
  }
}

/**
 * Direct standard vertex form matcher for Parabolas:
 * Examples:
 *   (y - 2)^2 = 8(x - 1)
 *   (x - 1)^2 = 4(y - 2)
 *   y = (x - 1)^2
 *   y = 2(x - 3)^2 + 4
 *   (y + 1)^2 = -4x
 *   x = -(y - 2)^2
 */
function tryParseStandardVertexParabola(
  clean: string,
  lang: Language
): ConicAnalysisResult | null {
  // Pattern 1: (quadVar - k)^2 = mult * (linVar - h) or quadVar^2 = mult * (linVar - h)
  const pattern1 = /^(\(?([xy])([+-][\d.]+)?\)?\^2|[xy]\^2)=([+-]?[\d./]+)?\*?\(?([xy])([+-][\d.]+)?\)?$/i;
  const m1 = clean.match(pattern1);
  if (m1) {
    const sm = m1[1].match(/\(?([xy])([+-][\d.]+)?\)?\^2/i);
    const quadVar = (sm ? sm[1] : m1[1][0]).toLowerCase();
    const quadShift = sm && sm[2] ? parseFloat(sm[2]) : 0;

    let multStr = m1[4] || '1';
    let mult = 1;
    if (multStr === '+') mult = 1;
    else if (multStr === '-') mult = -1;
    else if (multStr.includes('/')) {
      const [n, d] = multStr.split('/');
      mult = parseFloat(n) / parseFloat(d);
    } else {
      mult = parseFloat(multStr);
    }

    const linVar = m1[5].toLowerCase();
    const linShift = m1[6] ? parseFloat(m1[6]) : 0;

    if (quadVar !== linVar && !isNaN(mult) && mult !== 0) {
      // (quadVar + quadShift)^2 = mult * (linVar + linShift)
      // quadVar^2 + 2*quadShift*quadVar - mult*linVar + (quadShift^2 - mult*linShift) = 0
      const orientation = quadVar === 'y' ? 'horizontal' : 'vertical';
      const A = 1;
      const B = 2 * quadShift;
      const C = -mult;
      const D = quadShift * quadShift - mult * linShift;
      return solveParabola(orientation, A, B, C, D, lang);
    }
  }

  // Pattern 2: linVar = a * (quadVar - shift)^2 + k or linVar = (quadVar - shift)^2
  const pattern2 = /^([xy])=([+-]?[\d./]+)?\*?(\(?([xy])([+-][\d.]+)?\)?\^2|[xy]\^2)([+-][\d./]+)?$/i;
  const m2 = clean.match(pattern2);
  if (m2) {
    const linVar = m2[1].toLowerCase();
    let aStr = m2[2] || '1';
    let a = 1;
    if (aStr === '+') a = 1;
    else if (aStr === '-') a = -1;
    else if (aStr.includes('/')) {
      const [n, d] = aStr.split('/');
      a = parseFloat(n) / parseFloat(d);
    } else {
      a = parseFloat(aStr);
    }

    const sm = m2[3].match(/\(?([xy])([+-][\d.]+)?\)?\^2/i);
    const quadVar = (sm ? sm[1] : m2[3][0]).toLowerCase();
    const quadShift = sm && sm[2] ? parseFloat(sm[2]) : 0;
    const k = m2[6] ? parseFloat(m2[6]) : 0;

    if (linVar !== quadVar && !isNaN(a) && a !== 0) {
      // linVar = a * (quadVar + quadShift)^2 + k
      // a * quadVar^2 + 2*a*quadShift*quadVar - linVar + (a*quadShift^2 + k) = 0
      const orientation = quadVar === 'y' ? 'horizontal' : 'vertical';
      const A = a;
      const B = 2 * a * quadShift;
      const C = -1;
      const D = a * quadShift * quadShift + k;
      return solveParabola(orientation, A, B, C, D, lang);
    }
  }

  return null;
}

/**
 * Divides polynomial terms inside a parenthesis by a divisor cleanly,
 * preventing regex partial-match bugs on decimal digits.
 */
function divideInnerPolynomialTerms(inner: string, divisor: number): string {
  let s = inner.replace(/\s+/g, '');
  if (!s.startsWith('+') && !s.startsWith('-')) s = '+' + s;
  const terms = s.match(/[+-][^+-]+/g) || [];
  const result: string[] = [];

  for (const t of terms) {
    const isX2 = /x\^2/i.test(t);
    const isY2 = /y\^2/i.test(t);
    const hasX = /x/i.test(t) && !isX2;
    const hasY = /y/i.test(t) && !isY2;
    const numPart = t.replace(/\^2/g, '').replace(/[xyXY]/g, '');

    let c = 1;
    if (numPart === '+') c = 1;
    else if (numPart === '-') c = -1;
    else if (numPart.includes('/')) {
      const [n, d] = numPart.split('/');
      c = parseFloat(n) / parseFloat(d);
    } else {
      c = parseFloat(numPart);
    }
    if (isNaN(c)) c = 1;

    const newC = c / divisor;
    const sign = newC >= 0 ? '+' : '-';
    const absVal = Math.abs(newC);
    const varPart = isX2 ? 'x^2' : isY2 ? 'y^2' : hasX ? 'x' : hasY ? 'y' : '';
    result.push(`${sign}${absVal}${varPart}`);
  }

  return result.join('');
}

/**
 * Universal Conic Section Parser:
 * Strictly validates equations and gives accurate educational error messages
 * for non-conic, linear, higher-degree, or non-math strings (e.g. 'abc', 'x + y = 1').
 */
export function parseUniversalConic(
  rawInput: string,
  lang: Language = 'en'
): ConicAnalysisResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error(lang === 'zh' ? '请输入方程（输入框不能为空）' : 'Please enter an equation (input cannot be empty).');
  }

  // 1. Detect unknown non-mathematical text like 'abc', 'test', 'hello'
  const clean = normalizeMathString(trimmed);

  // 2. Detect rotated conic section with xy cross term (e.g. xy = 1, x^2 + 2xy + y^2 = 4)
  if (/x\s*\*?\s*y|y\s*\*?\s*x/i.test(clean)) {
    throw new Error(
      lang === 'zh'
        ? `检测到含有 xy 交叉项（如 "${trimmed}"）的斜置/旋转圆锥曲线！此类曲线需要使用坐标轴旋转矩阵（旋转角 θ = ½ arccot((A-C)/B)）化简，超出了平移配方法（Completing the Square）解题范畴。暂不支持旋转圆锥曲线。`
        : `Rotated conic sections with xy cross-terms (e.g., "${trimmed}") require a coordinate axis rotation matrix (theta = 0.5 * arccot((A-C)/B)), which is beyond completing the square. Rotated conic mode is currently unsupported.`
    );
  }

  const nonMathTokens = clean.replace(/\\?[a-zA-Z]+/g, (match) => {
    const lower = match.toLowerCase();
    // Allow variable names x, y
    if (lower === 'x' || lower === 'y') return '';
    return match;
  });

  const illegalLetters = nonMathTokens.match(/[a-zA-Z]+/g);
  if (illegalLetters && illegalLetters.length > 0) {
    const badStr = illegalLetters.slice(0, 3).join(', ');
    throw new Error(
      lang === 'zh'
        ? `输入包含无效字母或非数学文本 "${badStr}"。请输入包含未知数 x 或 y 的二次方程。`
        : `Input contains invalid characters "${badStr}". Please enter an equation in variables x and y.`
    );
  }

  // 3. Must contain at least one variable x or y
  if (!/[xy]/i.test(clean)) {
    throw new Error(
      lang === 'zh'
        ? `输入 "${trimmed}" 未包含未知数 x 或 y！请输入二次曲线方程，例如 y² - 4y - 8x + 12 = 0 或 y² = 8x。`
        : `Equation "${trimmed}" has no variables x or y. Please enter a valid conic section equation.`
    );
  }

  // 4. Detect higher degree terms (e.g. x^3, y^4)
  if (/[xy]\^[3-9]/i.test(clean) || /[xy]\^\d{2,}/i.test(clean)) {
    throw new Error(
      lang === 'zh'
        ? '检测到三次或更高次项！抛物线/椭圆/双曲线等圆锥曲线的最高次数必须严格为二次 (²)。'
        : 'Degree higher than 2 detected. Conic sections are strictly quadratic equations (degree 2).'
    );
  }

  // 5. Detect linear equations without any squared terms
  const hasSquaredPattern =
    /[xy]\^2/i.test(clean) ||
    /\([xy][+-]?[\d./]*\)\^2/i.test(clean) ||
    /\([+-]?[\d./]*[xy][+-]?[\d./]*\)\^2/i.test(clean) ||
    /\([xy][+-]?[\d./]*\)\s*\*?\s*\([xy][+-]?[\d./]*\)/i.test(clean);

  if (!hasSquaredPattern) {
    throw new Error(
      lang === 'zh'
        ? `方程 "${trimmed}" 为一次线性方程（平面几何中表示直线），缺少二次项 (x² 或 y²)，不是抛物线或圆锥曲线！`
        : `Equation "${trimmed}" is a linear equation (a straight line). It lacks degree-2 terms (x² or y²) and is not a conic section.`
    );
  }

  // If no equal sign is present, but has squared variable, automatically append = 0
  let equationStr = clean;
  if (!equationStr.includes('=')) {
    equationStr += '=0';
  }

  // 6. First attempt: Direct match standard vertex form ellipse / hyperbola
  const standardEllipseHyperbola = tryParseStandardVertexEllipseHyperbola(equationStr, lang);
  if (standardEllipseHyperbola) {
    return standardEllipseHyperbola;
  }

  // 7. Second attempt: Direct match standard vertex form parabola
  const standardParabola = tryParseStandardVertexParabola(equationStr, lang);
  if (standardParabola) {
    return standardParabola;
  }

  // 8. General Polynomial Expansion: Split across '=' and collect terms
  return parseGeneralConicPolynomial(equationStr, lang);
}

/**
 * Decomposes general equations:
 * A x^2 + B y^2 + C x + D y + E = 0
 */
function parseGeneralConicPolynomial(clean: string, lang: Language): ConicAnalysisResult {
  // Pre-expand binomial squares like (x - 3)^2 or (x - 3)*(x - 3)
  const expanded = expandAlgebraicParentheses(clean);

  const parts = expanded.split('=');
  const left = parts[0] || '';
  const right = parts[1] || '0';

  let coeffX2 = 0;
  let coeffY2 = 0;
  let coeffX = 0;
  let coeffY = 0;
  let coeffConst = 0;

  const parseSide = (sideStr: string, multiplier: number) => {
    let s = sideStr.trim();
    if (!s) return;

    // Expand any fraction denominators on parenthesized polynomial terms, e.g. (1x^2 - 2x + 1)/4
    s = s.replace(/\(([^)]+)\)\s*\/\s*([\d.]+)/gi, (_, inner, dStr) => {
      const d = parseFloat(dStr);
      if (isNaN(d) || d === 0) return inner;
      return divideInnerPolynomialTerms(inner, d);
    });

    s = s.replace(/[()]/g, ' ').replace(/\s+/g, '');

    if (!s.startsWith('+') && !s.startsWith('-')) s = '+' + s;

    const chunks = s.match(/[+-][^+-]+/g) || [];
    for (const chunk of chunks) {
      const isX2 = /x\^2/i.test(chunk);
      const isY2 = /y\^2/i.test(chunk);
      const hasX = /x/i.test(chunk) && !isX2;
      const hasY = /y/i.test(chunk) && !isY2;

      let numStr = chunk.replace(/\^2/g, '').replace(/[xyXY]/g, '').replace(/\s+/g, '');
      let coeff = 1;
      if (numStr === '+') coeff = 1;
      else if (numStr === '-') coeff = -1;
      else if (numStr.includes('/')) {
        const [n, d] = numStr.split('/');
        const parsedN = parseFloat(n);
        const parsedD = parseFloat(d);
        coeff = !isNaN(parsedN) && !isNaN(parsedD) && parsedD !== 0 ? parsedN / parsedD : 0;
      } else {
        coeff = parseFloat(numStr);
        if (isNaN(coeff)) coeff = 0;
      }
      coeff *= multiplier;

      if (isX2) coeffX2 += coeff;
      else if (isY2) coeffY2 += coeff;
      else if (hasX) coeffX += coeff;
      else if (hasY) coeffY += coeff;
      else coeffConst += coeff;
    }
  };

  parseSide(left, 1);
  if (parts.length > 1 && parts[1] && parts[1] !== '0') {
    parseSide(parts[1], -1);
  }

  const hasX2 = Math.abs(coeffX2) > 1e-7;
  const hasY2 = Math.abs(coeffY2) > 1e-7;

  // Case 1: Exactly one squared variable -> Parabola
  if (hasX2 && !hasY2) {
    if (Math.abs(coeffY) < 1e-7) {
      throw new Error(
        lang === 'zh'
          ? '方程中仅有 x²，缺少一次变量 y，退化为平行直线或点，不是抛物线！'
          : 'Lacks linear variable y; equation degenerates into parallel lines or points.'
      );
    }
    return solveParabola('vertical', coeffX2, coeffX, coeffY, coeffConst, lang);
  }
  if (!hasX2 && hasY2) {
    if (Math.abs(coeffX) < 1e-7) {
      throw new Error(
        lang === 'zh'
          ? '方程中仅有 y²，缺少一次变量 x，退化为平行直线或点，不是抛物线！'
          : 'Lacks linear variable x; equation degenerates into parallel lines or points.'
      );
    }
    return solveParabola('horizontal', coeffY2, coeffY, coeffX, coeffConst, lang);
  }

  // Case 2: Both squared variables present -> Ellipse or Hyperbola
  if (hasX2 && hasY2) {
    if (coeffX2 * coeffY2 > 0) {
      return solveEllipse(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
    } else {
      return solveHyperbola(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
    }
  }

  throw new Error(
    lang === 'zh'
      ? '未在方程中检测到有效二次项 (x² 或 y²)，不是圆锥曲线！'
      : 'No squared variable found. A conic section requires degree 2.'
  );
}

// Backward compatibility export
export const parseNaturalEquation = parseUniversalConic;
