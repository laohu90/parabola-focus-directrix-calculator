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
 * Universal Conic Section Parser:
 * Supports:
 * - Parabola: y^2 - 4y - 8x + 12 = 0, y^2 = 8x, x^2 = -6y, y = 0.25x^2, (y-2)^2 = 8(x-1)
 * - Ellipse: \frac{x^2}{16} + \frac{y^2}{9} = 1, 4x^2 + 9y^2 - 16x + 18y - 11 = 0, x^2/25 + y^2/16 = 1
 * - Hyperbola: \frac{x^2}{16} - \frac{y^2}{9} = 1, 4x^2 - 9y^2 = 36, (x-1)^2/4 - (y+2)^2/9 = 1
 */
export function parseUniversalConic(
  rawInput: string,
  lang: Language = 'en'
): ConicAnalysisResult {
  const clean = normalizeMathString(rawInput);
  if (!clean) {
    throw new Error(lang === 'zh' ? '请输入方程' : 'Please enter an equation.');
  }

  // 1. Check Standard Fraction Ellipse / Hyperbola: (x-h)^2/a^2 +/- (y-k)^2/b^2 = 1
  const fracPattern = /^([+-]?)(?:\(?([xy])([+-][\d.]+)?\)?\^2|\(([xy])([+-][\d.]+)?\)\^2)\/([\d.]+)([+-])(?:\(?([xy])([+-][\d.]+)?\)?\^2|\(([xy])([+-][\d.]+)?\)\^2)\/([\d.]+)=1$/i;
  // Also check simple x^2/a^2 +/- y^2/b^2 = 1
  const simpleFrac = /^([xy])\^2\/([\d.]+)([+-])([xy])\^2\/([\d.]+)=1$/i;
  const matchSimple = clean.match(simpleFrac);
  if (matchSimple) {
    const var1 = matchSimple[1].toLowerCase();
    const den1 = parseFloat(matchSimple[2]);
    const op = matchSimple[3];
    const var2 = matchSimple[4].toLowerCase();
    const den2 = parseFloat(matchSimple[5]);

    if (var1 === var2) throw new Error(lang === 'zh' ? '变量不能相同' : 'Variables cannot be identical.');

    // Common denominator: D = den1 * den2
    // If var1 is x: (x^2 * den2) +/- (y^2 * den1) = den1 * den2
    // => (den2)x^2 +/- (den1)y^2 - (den1 * den2) = 0
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

  // 2. Vertex Form Parabola: (y-k)^2 = 2p(x-h) or (x-h)^2 = 2p(y-k)
  const vertexParabolaRegex = /^\(([xy])([+-]?[\d./]+)?\)\^2=([+-]?[\d./]+)?(?:\*|\()?([xy])([+-]?[\d./]+)?\)?$/i;
  const matchParabolaVertex = clean.match(vertexParabolaRegex);
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
      // (u + quadShift)^2 = twoP * (v + linShift)
      // u^2 + 2*quadShift*u + quadShift^2 - twoP*v - twoP*linShift = 0
      const A = 1;
      const B = 2 * quadShift;
      const C = -twoP;
      const D = quadShift * quadShift - twoP * linShift;
      return solveParabola(orientation, A, B, C, D, lang);
    }
  }

  // 3. General Polynomial Expansion: Split across '=' and collect terms
  return parseGeneralConicPolynomial(clean, lang);
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
    if (!s.startsWith('+') && !s.startsWith('-')) s = '+' + s;

    const chunks = s.match(/[+-][^+-]+/g) || [];
    for (const chunk of chunks) {
      const isX2 = /x\^2/i.test(chunk);
      const isY2 = /y\^2/i.test(chunk);
      const hasX = /x/i.test(chunk) && !isX2;
      const hasY = /y/i.test(chunk) && !isY2;

      let numStr = chunk.replace(/\^2/g, '').replace(/[xyXY]/g, '');
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
    // x^2 + ... => vertical parabola
    return solveParabola('vertical', coeffX2, coeffX, coeffY, coeffConst, lang);
  }
  if (!hasX2 && hasY2) {
    // y^2 + ... => horizontal parabola
    return solveParabola('horizontal', coeffY2, coeffY, coeffX, coeffConst, lang);
  }

  // Case 2: Both squared variables present
  if (hasX2 && hasY2) {
    if (coeffX2 * coeffY2 > 0) {
      // Same sign -> Ellipse (or Circle)
      return solveEllipse(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
    } else {
      // Opposite signs -> Hyperbola
      return solveHyperbola(coeffX2, coeffY2, coeffX, coeffY, coeffConst, lang);
    }
  }

  throw new Error(
    lang === 'zh'
      ? '未在方程中检测到二次项 (x² 或 y²)，不是圆锥曲线！'
      : 'No squared variable found. A conic section requires degree 2.'
  );
}

// Keep backward compatibility export
export const parseNaturalEquation = parseUniversalConic;
