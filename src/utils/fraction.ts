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

// Convert a number (possibly decimal) to an exact reduced fraction
export function toFraction(val: number, tolerance = 1e-6): Fraction {
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

  // Fallback continued fraction approximation
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = absVal;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(absVal - h1 / k1) > absVal * tolerance && k1 < 1000);

  const g = gcd(h1, k1);
  return { num: sign * (h1 / g), den: k1 / g };
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
