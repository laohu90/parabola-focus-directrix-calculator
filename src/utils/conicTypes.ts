import {
  Fraction,
  formatFractionLaTeX,
  formatShiftTerm,
  formatSignedTermLaTeX,
  toFraction
} from './fraction.ts';
import { Language } from '../i18n/translations.ts';

export type ConicType = 'parabola' | 'ellipse' | 'hyperbola';
export type ParabolaOrientation = 'horizontal' | 'vertical';
export type OpenDirection = 'right' | 'left' | 'up' | 'down';

export interface StepExplanation {
  title: string;
  math: string;
  note?: string;
  whyExplanation?: string; // Pedagogical "Why" breakdown
  highlight?: boolean;
}

export interface ConicAnalysisResult {
  conicType: ConicType;
  rawEquation?: string;
  centerOrVertex: { x: number; y: number; xFrac: Fraction; yFrac: Fraction; label: string; latex?: string };
  foci: Array<{ x: number; y: number; xFrac: Fraction; yFrac: Fraction; label: string; latex?: string }>;
  vertices: Array<{ x: number; y: number; xFrac: Fraction; yFrac: Fraction; label: string; latex?: string }>;
  directrices: Array<{ type: 'x' | 'y'; val: number; latex: string }>;
  axesOfSymmetry: Array<{ type: 'x' | 'y'; val: number; latex: string; label: string }>;
  asymptotes?: Array<{ latex: string }>;
  eccentricity: { val: number; latex: string };
  latusRectum: { val: number; latex: string };
  standardLatex: string;
  parameters: {
    a?: number;
    b?: number;
    c?: number;
    p?: number;
    halfP?: number;
    orientation?: 'horizontal' | 'vertical';
    direction?: OpenDirection;
  };
  domainLatex: string;
  rangeLatex: string;
  steps: StepExplanation[];
}
