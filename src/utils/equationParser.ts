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
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    // LaTeX fractions \frac{a}{b} -> (a)/(b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Remove extra whitespace
    .replace(/\s+/g, '');
}

/**
 * Expands binomial squares (x - h)^2 or (x - h)*(x - h) -> x^2 - 2hx + h^2
 * and expands distribution over linear factors like 8(y + 1) -> 8y + 8.
 */
export function expandAlgebraicParentheses(input: string): string {
  let s = input;

  // 1. Replace (x-h)*(x-h) or (x-h)(x-h) with (x-h)^2
  s = s.replace(/\(([^)]+)\)\s*\*?\s*\(\1\)/g, '($1)^2');

  // 2. Expand (a*x + b)^2 or (a*y + b)^2
  const squarePattern = /\(([-+]?[\d./]*)\s*([xyXY])\s*([+-]\s*[\d./]+)\)\^2/gi;
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
    const bTrim = (bStr || '').replace(/\s+/g, '');
    if (bTrim.includes('/')) {
      const [n, d] = bTrim.split('/');
      b = parseFloat(n) / parseFloat(d);
    } else {
      b = parseFloat(bTrim);
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

    return `(${coeff2}${variable}^2 ${sign1} ${absCoeff1}${variable} ${sign2} ${absConst})`;
  });

  // 3. Expand outer distribution: e.g. 8(y + 1) -> (8y + 8) or -4(x - 2) -> (-4x + 8)
  const distPattern = /([+-]?\s*[\d.]+)\s*\*?\s*\(\s*([xyXY])\s*([+-]\s*[\d.]+)\s*\)/gi;
  s = s.replace(distPattern, (_, multStr, variable, bStr) => {
    const mult = parseFloat(multStr.replace(/\s+/g, ''));
    const b = parseFloat(bStr.replace(/\s+/g, ''));
    if (isNaN(mult) || isNaN(b)) return _;
    const coeffVar = mult;
    const constTerm = mult * b;
    const signVar = coeffVar >= 0 ? '+' : '-';
    const signConst = constTerm >= 0 ? '+' : '-';
    return `(${signVar}${Math.abs(coeffVar)}${variable} ${signConst} ${Math.abs(constTerm)})`;
  });

  return s;
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
  // Allowed letters in conic formulas: x, y, X, Y
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

  // 5. Detect linear equations without any squared terms (e.g. 'x + y = 1', '2x - 3y + 5 = 0', 'y = 2x')
  const hasSquaredPattern = /[xy]\^2/i.test(clean) || /\([xy][+-]?[\d./]*\)\^2/i.test(clean) || /\([xy][+-]?[\d./]*\)\s*\*?\s*\([xy][+-]?[\d./]*\)/i.test(clean);
  if (!hasSquaredPattern) {
    throw new Error(
      lang === 'zh'
        ? `方程 "${trimmed}" 为一次线性方程（平面几何中表示直线），缺少二次项 (x² 或 y²)，不是抛物线或圆锥曲线！`
        : `Equation "${trimmed}" is a linear equation (a straight line). It lacks degree-2 terms (x² or y²) and is not a conic section.`
    );
  }

  // If no equal sign is present, but has squared variable (e.g. y^2 - 4y - 8x + 12), automatically append = 0
  let equationStr = clean;
  if (!equationStr.includes('=')) {
    equationStr += '=0';
  }

  // Pre-expand binomial squares like (x - 3)^2 or (x - 3)*(x - 3)
  equationStr = expandAlgebraicParentheses(equationStr);

  // 6. Check Standard Fraction Ellipse / Hyperbola: (x-h)^2/a^2 +/- (y-k)^2/b^2 = 1
  const simpleFrac = /^([xy])\^2\/([\d.]+)([+-])([xy])\^2\/([\d.]+)=1$/i;
  const matchSimple = equationStr.match(simpleFrac);
  if (matchSimple) {
    const var1 = matchSimple[1].toLowerCase();
    const den1 = parseFloat(matchSimple[2]);
    const op = matchSimple[3];
    const var2 = matchSimple[4].toLowerCase();
    const den2 = parseFloat(matchSimple[5]);

    if (var1 === var2) throw new Error(lang === 'zh' ? '方程中变量不能完全相同' : 'Variables cannot be identical.');
    if (den1 <= 0 || den2 <= 0) throw new Error(lang === 'zh' ? '分母必须为正实数' : 'Denominators must be positive.');

    let coeffX = 0, coeffY = 0;
    if (var1 === 'x') {
      coeffX = den2;
      coeffY = op === '+' ? den1 : -den1;
    } else {
      coeffY = den2;
      coeffX = op === '+' ? den1 : -den1;
    }
    const constE = -(den1 * den2);

    if (coeffX * coeffY > 0) {
      return solveEllipse(coeffX, coeffY, 0, 0, constE, lang);
    } else {
      return solveHyperbola(coeffX, coeffY, 0, 0, constE, lang);
    }
  }

  // 7. Check Vertex Form Parabola: (y-k)^2 = 2p(x-h) or (x-h)^2 = 2p(y-k)
  const vertexParabolaRegex = /^\(([xy])([+-]?[\d./]+)?\)\^2=([+-]?[\d./]+)?(?:\*|\()?([xy])([+-]?[\d./]+)?\)?$/i;
  const matchParabolaVertex = equationStr.match(vertexParabolaRegex);
  if (matchParabolaVertex) {
    const quadVar = matchParabolaVertex[1].toLowerCase();
    const quadShiftStr = matchParabolaVertex[2] || '0';
    const twoPStr = matchParabolaVertex[3] || '1';
    const linVar = matchParabolaVertex[4].toLowerCase();
    const linShiftStr = matchParabolaVertex[5] || '0';

    if (quadVar !== linVar) {
      const parseNum = (s: string) => {
        if (!s || s === '+') return 1;
        if (s === '-') return -1;
        if (s.includes('/')) {
          const [n, d] = s.split('/');
          return parseFloat(n) / parseFloat(d);
        }
        return parseFloat(s);
      };

      const quadShift = parseNum(quadShiftStr);
      const linShift = parseNum(linShiftStr);
      const twoP = parseNum(twoPStr);

      const orientation = quadVar === 'y' ? 'horizontal' : 'vertical';
      const A = 1;
      const B = 2 * quadShift;
      const C = -twoP;
      const D = quadShift * quadShift - twoP * linShift;
      return solveParabola(orientation, A, B, C, D, lang);
    }
  }

  // 8. General Polynomial Expansion: Split across '=' and collect terms
  return parseGeneralConicPolynomial(equationStr, lang);
}

/**
 * Decomposes general equations:
 * A x^2 + B y^2 + C x + D y + E = 0
 */
function parseGeneralConicPolynomial(clean: string, lang: Language): ConicAnalysisResult {
  const parts = clean.split('=');
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

    // Expand any fraction denominators on parenthesized polynomial terms, e.g. (1x^2 - 2x + 1)/25
    s = s.replace(/\(([^)]+)\)\s*\/\s*([\d.]+)/gi, (_, inner, dStr) => {
      const d = parseFloat(dStr);
      if (isNaN(d) || d === 0) return inner;
      const expVar = inner.replace(/([+-]?\s*[\d./]*)\s*([xyXY](?:\^2)?)/gi, (m: string, cStr: string, vStr: string) => {
        let c = 1;
        const trimC = cStr.replace(/\s+/g, '');
        if (trimC === '' || trimC === '+') c = 1;
        else if (trimC === '-') c = -1;
        else if (trimC.includes('/')) {
          const [n, den] = trimC.split('/');
          c = parseFloat(n) / parseFloat(den);
        } else c = parseFloat(trimC);
        if (isNaN(c)) c = 1;
        const newC = c / d;
        return `${newC >= 0 ? '+' : ''}${newC}${vStr} `;
      });
      return expVar.replace(/([+-]\s*[\d.]+)(?![xyXY\^])/gi, (m: string, numStr: string) => {
        const num = parseFloat(numStr.replace(/\s+/g, ''));
        if (isNaN(num)) return m;
        const newNum = num / d;
        return `${newNum >= 0 ? '+' : ''}${newNum} `;
      });
    });

    s = s.replace(/[()]/g, ' ');

    if (!s.startsWith('+') && !s.startsWith('-')) s = '+' + s;

    const chunks = s.match(/[+-][^+-]+/g) || [];
    for (const chunk of chunks) {
      const isX2 = /x\^2/i.test(chunk);
      const isY2 = /y\^2/i.test(chunk);
      const hasX = /x/i.test(chunk) && !isX2;
      const hasY = /y/i.test(chunk) && !isY2;

      let numStr = chunk.replace(/\^2/g, '').replace(/[xyXY]/g, '').trim();
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

// Keep backward compatibility export
export const parseNaturalEquation = parseUniversalConic;
