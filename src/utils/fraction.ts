/**
 * Fraction and math utilities for exact arithmetic representation in LaTeX
 */

export interface Fraction {
  num: number;
  den: number;
}

// Greatest common divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Convert a number (possibly decimal) to an exact reduced fraction (denominators <= 64)
export function toFraction(val: number, tolerance = 1e-5): Fraction {
  if (Math.abs(val) < tolerance) {
    return { num: 0, den: 1 };
  }
  
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);

  // Check if it's already an integer
  if (Math.abs(absVal - Math.round(absVal)) < tolerance) {
    return { num: sign * Math.round(absVal), den: 1 };
  }

  // Common high school fractions search (denominators up to 64)
  for (let d = 2; d <= 64; d++) {
    const n = Math.round(absVal * d);
    if (Math.abs(absVal - n / d) < tolerance) {
      const g = gcd(n, d);
      return { num: sign * (n / g), den: d / g };
    }
  }

  // If no simple fraction with denominator <= 64 matches, return rounded clean value
  return { num: sign * (Math.round(absVal * 1000) / 1000), den: 1 };
}

// Format a fraction into clean LaTeX string
export function formatFractionLaTeX(f: Fraction | number): string {
  const frac = typeof f === 'number' ? toFraction(f) : f;
  if (frac.num === 0) return '0';
  if (frac.den === 1) return `${frac.num}`;
  
  if (frac.num < 0) {
    return `-\\frac{${Math.abs(frac.num)}}{${frac.den}}`;
  }
  return `\\frac{${frac.num}}{${frac.den}}`;
}

// Format number with sign for polynomial expressions, e.g., "+ 4" or "- 3" or ""
export function formatSignedTermLaTeX(val: number, variable = ''): string {
  if (Math.abs(val) < 1e-7) return '';
  const frac = toFraction(val);
  const sign = frac.num > 0 ? '+' : '-';
  const absNum = Math.abs(frac.num);

  let coeffStr = '';
  if (frac.den === 1) {
    if (absNum === 1 && variable !== '') {
      coeffStr = '';
    } else {
      coeffStr = `${absNum}`;
    }
  } else {
    coeffStr = `\\frac{${absNum}}{${frac.den}}`;
  }

  return ` ${sign} ${coeffStr}${variable}`;
}

// Format linear factor (x - h) or (x + 3)
export function formatShiftTerm(variable: 'x' | 'y', shift: number): string {
  if (Math.abs(shift) < 1e-7) {
    return variable;
  }
  const frac = toFraction(shift);
  if (frac.num > 0) {
    // x - h
    if (frac.den === 1) return `(${variable} - ${frac.num})`;
    return `\\left(${variable} - \\frac{${frac.num}}{${frac.den}}\\right)`;
  } else {
    // x - (-h) = x + h
    const absVal = Math.abs(frac.num);
    if (frac.den === 1) return `(${variable} + ${absVal})`;
    return `\\left(${variable} + \\frac{${absVal}}{${frac.den}}\\right)`;
  }
}

/**
 * Formats sqrt(valSq) in simplified LaTeX radical form if close to integer/fraction,
 * e.g. 5 -> \sqrt{5}, 12 -> 2\sqrt{3}, 9 -> 3, 5/4 -> \frac{\sqrt{5}}{2}
 */
export function formatExactSqrtLaTeX(valSq: number): string {
  if (valSq < 0) return 'i';
  if (Math.abs(valSq) < 1e-7) return '0';

  const frac = toFraction(valSq);
  const numSq = Math.abs(frac.num);
  const denSq = Math.abs(frac.den);

  const simplifyIntSqrt = (n: number): { outside: number; inside: number } => {
    let outside = 1;
    let inside = n;
    for (let d = Math.floor(Math.sqrt(inside)); d >= 2; d--) {
      if (inside % (d * d) === 0) {
        outside *= d;
        inside /= (d * d);
      }
    }
    return { outside, inside };
  };

  const denRoot = Math.sqrt(denSq);
  const denIsInt = Math.abs(denRoot - Math.round(denRoot)) < 1e-5;

  if (denIsInt) {
    const kDen = Math.round(denRoot);
    const { outside, inside } = simplifyIntSqrt(numSq);
    let numStr = '';
    if (inside === 1) numStr = `${outside}`;
    else if (outside === 1) numStr = `\\sqrt{${inside}}`;
    else numStr = `${outside}\\sqrt{${inside}}`;

    if (kDen === 1) return numStr;
    return `\\frac{${numStr}}{${kDen}}`;
  }

  const { outside, inside } = simplifyIntSqrt(numSq * denSq);
  let numStr = '';
  if (inside === 1) numStr = `${outside}`;
  else if (outside === 1) numStr = `\\sqrt{${inside}}`;
  else numStr = `${outside}\\sqrt{${inside}}`;

  return `\\frac{${numStr}}{${denSq}}`;
}

/**
 * Formats (h ± c) or (h - c) or (h + c) in LaTeX when c = sqrt(valSq) and h is center offset
 */
export function formatOffsetRadicalLaTeX(h: number, valSq: number, sign: '+' | '-' | '±' = '±'): string {
  const cRad = formatExactSqrtLaTeX(valSq);

  if (!cRad.includes('\\sqrt')) {
    const cNum = parseFloat(cRad);
    if (!isNaN(cNum)) {
      if (sign === '+') return formatFractionLaTeX(h + cNum);
      if (sign === '-') return formatFractionLaTeX(h - cNum);
      return `${formatFractionLaTeX(h - cNum)}, \\ ${formatFractionLaTeX(h + cNum)}`;
    }
  }

  const hFrac = toFraction(h);
  if (hFrac.num === 0) {
    if (sign === '+') return cRad;
    if (sign === '-') return `-${cRad}`;
    return `\\pm ${cRad}`;
  }

  const hStr = formatFractionLaTeX(hFrac);
  if (sign === '+') return `${hStr} + ${cRad}`;
  if (sign === '-') return `${hStr} - ${cRad}`;
  return `${hStr} \\pm ${cRad}`;
}

