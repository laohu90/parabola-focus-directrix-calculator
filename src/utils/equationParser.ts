import {
  ParabolaOrientation,
  ParabolaAnalysisResult,
  solveParabolaGeneral,
  solveParabolaStandard,
  solveParabolaFunction,
  solveParabolaVertexForm
} from './parabolaSolver.ts';
import { Language } from '../i18n/translations.ts';

/**
 * Robust equation parser that converts natural math text into ParabolaAnalysisResult.
 * Handles:
 * 1. Standard origin: y^2 = 8x, x^2 = -6y, y^2 = (1/2)x, etc.
 * 2. Vertex form: (y - 2)^2 = 8(x - 1), (x + 3)^2 = -4(y - 2)
 * 3. Function form: y = 2x^2 + 4x - 1, y = 0.25x^2, x = -0.5y^2 + 2y - 3
 * 4. General form: y^2 - 4y - 8x + 12 = 0, 2x^2 + 8x + 4y - 2 = 0
 */
export function parseNaturalEquation(
  rawInput: string,
  lang: Language = 'en'
): ParabolaAnalysisResult {
  const clean = rawInput
    .trim()
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/²/g, '^2');

  if (!clean) {
    throw new Error(lang === 'zh' ? '请输入抛物线方程' : 'Please enter a parabola equation.');
  }

  // 1. Vertex Form: e.g. (y-k)^2 = 2p(x-h) or (x-h)^2 = 2p(y-k)
  const vertexFormRegex = /^\(([xy])([+-]?[\d./]+)?\)\^2=([+-]?[\d./]+)?(?:\*|\()?([xy])([+-]?[\d./]+)?\)?$/i;
  const vertexMatch = clean.match(vertexFormRegex);
  if (vertexMatch) {
    const quadVar = vertexMatch[1].toLowerCase();
    const quadShiftStr = vertexMatch[2] || '0';
    const twoPStr = vertexMatch[3] || '1';
    const linVar = vertexMatch[4].toLowerCase();
    const linShiftStr = vertexMatch[5] || '0';

    if (quadVar === linVar) {
      throw new Error(lang === 'zh' ? '方程主变量与一次变量不能相同' : 'Squared variable and linear variable cannot be the same.');
    }

    const parseNum = (s: string) => {
      if (!s || s === '+') return 1;
      if (s === '-') return -1;
      if (s.includes('/')) {
        const [n, d] = s.split('/');
        return parseFloat(n) / parseFloat(d);
      }
      return parseFloat(s);
    };

    const quadShift = parseNum(quadShiftStr); // (u + shift)^2 -> center is -shift
    const linShift = parseNum(linShiftStr);
    const twoP = parseNum(twoPStr);

    const orientation: ParabolaOrientation = quadVar === 'y' ? 'horizontal' : 'vertical';
    // Center coordinate:
    // (y - k)^2 => if string is (y - 2) then quadShiftStr = "-2", so k = 2
    const k = quadVar === 'y' ? -quadShift : -linShift;
    const h = quadVar === 'y' ? -linShift : -quadShift;

    return solveParabolaVertexForm(orientation, h, k, twoP);
  }

  // 2. Standard Origin Form: e.g. y^2 = 8x or x^2 = -6y
  const stdRegex = /^([xy])\^2=([+-]?[\d./]+)?([xy])$/i;
  const stdMatch = clean.match(stdRegex);
  if (stdMatch) {
    const quadVar = stdMatch[1].toLowerCase();
    let coeffStr = stdMatch[2];
    const linVar = stdMatch[3].toLowerCase();

    if (quadVar === linVar) {
      throw new Error(lang === 'zh' ? '抛物线不能两个变量相同' : 'Invalid parabola equation.');
    }

    let coeff = 1;
    if (coeffStr === '-') coeff = -1;
    else if (coeffStr && coeffStr !== '+') {
      if (coeffStr.includes('/')) {
        const [n, d] = coeffStr.split('/');
        coeff = parseFloat(n) / parseFloat(d);
      } else {
        coeff = parseFloat(coeffStr);
      }
    }

    return solveParabolaStandard(quadVar === 'y' ? 'horizontal' : 'vertical', coeff);
  }

  // 3. Function Form: y = a*x^2 + b*x + c or x = a*y^2 + b*y + c
  const funcRegex = /^([xy])=([+-]?[\d./]*)?([xy])\^2(?:([+-][\d./]*)?([xy]))?(?:([+-][\d./]+))?$/i;
  const funcMatch = clean.match(funcRegex);
  if (funcMatch) {
    const linVar = funcMatch[1].toLowerCase();
    let aStr = funcMatch[2];
    const quadVar = funcMatch[3].toLowerCase();
    let bStr = funcMatch[4];
    const bVar = funcMatch[5] ? funcMatch[5].toLowerCase() : null;
    let cStr = funcMatch[6];

    if (linVar !== quadVar) {
      const parseCoeff = (s?: string) => {
        if (!s) return 0;
        if (s === '+' || s === '') return 1;
        if (s === '-') return -1;
        if (s.includes('/')) {
          const [n, d] = s.split('/');
          return parseFloat(n) / parseFloat(d);
        }
        return parseFloat(s);
      };

      const a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseCoeff(aStr);
      const b = bVar === quadVar ? parseCoeff(bStr) : 0;
      const c = parseCoeff(cStr);

      const orientation: ParabolaOrientation = quadVar === 'y' ? 'horizontal' : 'vertical';
      return solveParabolaFunction(orientation, a, b, c);
    }
  }

  // 4. General Quadratic: parse all terms into Ay^2 + By + Cx + D = 0 or Ax^2 + Bx + Cy + D = 0
  return parseGeneralPolynomial(clean, lang);
}

/**
 * General polynomial parser that breaks expression across '='
 */
function parseGeneralPolynomial(raw: string, lang: Language): ParabolaAnalysisResult {
  const parts = raw.split('=');
  let left = parts[0] || '';
  let right = parts[1] || '0';

  // Move everything to left side: expr = 0
  const normalized = left + (right !== '0' ? '-(' + right + ')' : '');

  // Determine which is squared: x^2 or y^2
  const hasX2 = /x\^2/i.test(normalized);
  const hasY2 = /y\^2/i.test(normalized);

  if (hasX2 && hasY2) {
    throw new Error(
      lang === 'zh'
        ? '方程中同时含有 x² 和 y²，此为椭圆/双曲线或圆，并非抛物线！'
        : 'Equation contains both x² and y². Parabola must have exactly one squared variable.'
    );
  }
  if (!hasX2 && !hasY2) {
    throw new Error(
      lang === 'zh'
        ? '方程中未检测到二次项 (x² 或 y²)，不是二次抛物线！'
        : 'No squared term (x² or y²) found. Parabola requires degree 2.'
    );
  }

  const orientation: ParabolaOrientation = hasY2 ? 'horizontal' : 'vertical';
  const quadVar = orientation === 'horizontal' ? 'y' : 'x';
  const linVar = orientation === 'horizontal' ? 'x' : 'y';

  // We can expand or evaluate terms by simple polynomial extraction
  // Regex to extract terms: ([+-]?[0-9./]*)(?:([xy])(\^2)?)?
  // Let's tokenize by + and -
  const termRegex = /([+-]?[\d./]*)(?:([xy])(?:\^2)?)?/gi;
  
  let A = 0; // quadVar^2
  let B = 0; // quadVar
  let C = 0; // linVar
  let D = 0; // constant

  // Prepare string for tokenization: replace -(...) if any
  let expr = left;
  if (parts.length > 1 && parts[1] && parts[1] !== '0') {
    // subtract right side
    let rightStr = parts[1];
    // Invert signs in rightStr
    // A simple trick: add '+(' and ')*(-1)'
    // For standard user inputs like y^2 - 4y = 8x - 12
    // Let's parse left side with sign +1 and right side with sign -1!
  }

  const parseSide = (sideStr: string, multiplier: number) => {
    // Add '+' at beginning if starts with variable or digit without sign
    let s = sideStr.trim();
    if (!s.startsWith('+') && !s.startsWith('-')) {
      s = '+' + s;
    }

    // Match all signed chunks: [+-][^+-]+
    const chunks = s.match(/[+-][^+-]+/g) || [];
    for (const chunk of chunks) {
      const isQuad = chunk.includes('^2');
      const hasX = chunk.includes('x') || chunk.includes('X');
      const hasY = chunk.includes('y') || chunk.includes('Y');

      // Extract coefficient
      let numStr = chunk
        .replace(/\^2/g, '')
        .replace(/[xyXY]/g, '');

      let coeff = 1;
      if (numStr === '+') coeff = 1;
      else if (numStr === '-') coeff = -1;
      else if (numStr.includes('/')) {
        const [n, d] = numStr.split('/');
        coeff = parseFloat(n) / parseFloat(d);
      } else {
        coeff = parseFloat(numStr) || 0;
      }

      coeff *= multiplier;

      if (isQuad) {
        A += coeff;
      } else if (orientation === 'horizontal') {
        if (hasY) B += coeff;
        else if (hasX) C += coeff;
        else D += coeff;
      } else {
        if (hasX) B += coeff;
        else if (hasY) C += coeff;
        else D += coeff;
      }
    }
  };

  parseSide(left, 1);
  if (parts.length > 1 && parts[1]) {
    parseSide(parts[1], -1);
  }

  if (Math.abs(A) < 1e-7) {
    throw new Error(lang === 'zh' ? '二次项系数为 0，不是抛物线！' : 'Leading quadratic coefficient is 0.');
  }
  if (Math.abs(C) < 1e-7) {
    throw new Error(lang === 'zh' ? '一次变量系数为 0，无法构成抛物线！' : 'Linear variable coefficient is 0.');
  }

  return solveParabolaGeneral(orientation, A, B, C, D);
}
