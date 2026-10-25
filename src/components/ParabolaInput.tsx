import React, { useState } from 'react';
import {
  ParabolaOrientation,
  ParabolaAnalysisResult,
  solveParabolaGeneral,
  solveParabolaStandard,
  solveParabolaFunction
} from '../utils/parabolaSolver.ts';
import { parseNaturalEquation } from '../utils/equationParser.ts';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import { Calculator, ArrowRight, RotateCcw, Flame, Sparkles } from 'lucide-react';

interface ParabolaInputProps {
  onSolve: (result: ParabolaAnalysisResult) => void;
  currentResult: ParabolaAnalysisResult | null;
  lang: Language;
}

export const ParabolaInput: React.FC<ParabolaInputProps> = ({ onSolve, lang }) => {
  const t = translations[lang].input;

  const [activeTab, setActiveTab] = useState<'smart' | 'general' | 'standard' | 'function'>('smart');

  // Smart natural input
  const [naturalEq, setNaturalEq] = useState<string>('y^2 - 4y - 8x + 12 = 0');

  // General Form: A*u^2 + B*u + C*v + D = 0
  const [genOrientation, setGenOrientation] = useState<ParabolaOrientation>('horizontal');
  const [genA, setGenA] = useState<string>('1');
  const [genB, setGenB] = useState<string>('-4');
  const [genC, setGenC] = useState<string>('-8');
  const [genD, setGenD] = useState<string>('12');

  // Standard Form: y^2 = k*x or x^2 = k*y
  const [stdOrientation, setStdOrientation] = useState<ParabolaOrientation>('horizontal');
  const [stdCoeff, setStdCoeff] = useState<string>('8');

  // Function Form: y = ax^2 + bx + c or x = ay^2 + by + c
  const [funcOrientation, setFuncOrientation] = useState<ParabolaOrientation>('vertical');
  const [funcA, setFuncA] = useState<string>('0.25');
  const [funcB, setFuncB] = useState<string>('0');
  const [funcC, setFuncC] = useState<string>('0');

  const [inputError, setInputError] = useState<string | null>(null);

  const parseVal = (str: string): number => {
    const trimmed = str.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 2) {
        const n = parseFloat(parts[0]);
        const d = parseFloat(parts[1]);
        if (d !== 0 && !isNaN(n) && !isNaN(d)) return n / d;
      }
    }
    const val = parseFloat(trimmed);
    if (isNaN(val)) throw new Error(`"${str}" is not a valid number or fraction.`);
    return val;
  };

  const handleSolveSmart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setInputError(null);
      const res = parseNaturalEquation(naturalEq, lang);
      onSolve(res);
    } catch (err: any) {
      setInputError(err.message || 'Error parsing equation. Please check syntax.');
    }
  };

  const handleSolveGeneral = () => {
    try {
      setInputError(null);
      const a = parseVal(genA);
      const b = parseVal(genB);
      const c = parseVal(genC);
      const d = parseVal(genD);
      const res = solveParabolaGeneral(genOrientation, a, b, c, d, lang);
      onSolve(res);
    } catch (err: any) {
      setInputError(err.message || 'Error solving equation.');
    }
  };

  const handleSolveStandard = () => {
    try {
      setInputError(null);
      const k = parseVal(stdCoeff);
      if (Math.abs(k) < 1e-7) throw new Error('Linear coefficient cannot be zero.');
      const res = solveParabolaStandard(stdOrientation, k, lang);
      onSolve(res);
    } catch (err: any) {
      setInputError(err.message || 'Error solving standard form.');
    }
  };

  const handleSolveFunction = () => {
    try {
      setInputError(null);
      const a = parseVal(funcA);
      const b = parseVal(funcB);
      const c = parseVal(funcC);
      if (Math.abs(a) < 1e-7) throw new Error('Leading quadratic coefficient a cannot be zero.');
      const res = solveParabolaFunction(funcOrientation, a, b, c, lang);
      onSolve(res);
    } catch (err: any) {
      setInputError(err.message || 'Error solving function form.');
    }
  };

  // Multilingual curated presets
  const presets = [
    {
      badge: lang === 'zh' ? '基础必考' : 'Standard',
      latex: 'y^2 = 8x',
      desc: lang === 'zh' ? '右开口标准方程' : 'Right-opening standard form',
      action: () => {
        setNaturalEq('y^2 = 8x');
        const res = solveParabolaStandard('horizontal', 8, lang);
        onSolve(res);
      }
    },
    {
      badge: lang === 'zh' ? '负号易错' : 'Negative Coeff',
      latex: 'x^2 = -6y',
      desc: lang === 'zh' ? '向下开口易错题' : 'Down-opening parabola',
      action: () => {
        setNaturalEq('x^2 = -6y');
        const res = solveParabolaStandard('vertical', -6, lang);
        onSolve(res);
      }
    },
    {
      badge: lang === 'zh' ? '配方大题' : 'Completing Square',
      latex: 'y^2 - 4y - 8x + 12 = 0',
      desc: lang === 'zh' ? '完整配方法拆解' : 'Full complete the square',
      action: () => {
        setNaturalEq('y^2 - 4y - 8x + 12 = 0');
        const res = solveParabolaGeneral('horizontal', 1, -4, -8, 12, lang);
        onSolve(res);
      }
    },
    {
      badge: lang === 'zh' ? '上下开口' : 'Vertical Vertex',
      latex: 'x^2 + 6x + 4y + 1 = 0',
      desc: lang === 'zh' ? '竖直轴配方题' : 'Vertical axis complete square',
      action: () => {
        setNaturalEq('x^2 + 6x + 4y + 1 = 0');
        const res = solveParabolaGeneral('vertical', 1, 6, 4, 1, lang);
        onSolve(res);
      }
    },
    {
      badge: lang === 'zh' ? '初高衔接' : 'Function Form',
      latex: 'y = \\frac{1}{4}x^2',
      desc: lang === 'zh' ? '二次函数求焦点' : 'Convert y = ax² to 2p form',
      action: () => {
        setNaturalEq('y = 0.25x^2');
        const res = solveParabolaFunction('vertical', 0.25, 0, 0, lang);
        onSolve(res);
      }
    },
    {
      badge: lang === 'zh' ? '系数≠1' : 'Leading Coeff ≠ 1',
      latex: '2y^2 - 8y - 16x + 24 = 0',
      desc: lang === 'zh' ? '首项归一再配方' : 'Divide by leading coeff first',
      action: () => {
        setNaturalEq('2y^2 - 8y - 16x + 24 = 0');
        const res = solveParabolaGeneral('horizontal', 2, -8, -16, 24, lang);
        onSolve(res);
      }
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Header / Mode Switcher */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sky-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
          <button
            onClick={() => { setActiveTab('smart'); setInputError(null); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'smart' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.smartTab}
          </button>
          <button
            onClick={() => { setActiveTab('general'); setInputError(null); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'general' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.generalTab}
          </button>
          <button
            onClick={() => { setActiveTab('standard'); setInputError(null); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'standard' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.standardTab}
          </button>
          <button
            onClick={() => { setActiveTab('function'); setInputError(null); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'function' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.functionTab}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* TAB 1: Smart Natural Equation Input */}
        {activeTab === 'smart' && (
          <form onSubmit={handleSolveSmart} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.smartPlaceholder}
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={naturalEq}
                    onChange={(e) => setNaturalEq(e.target.value)}
                    placeholder="y^2 - 4y - 8x + 12 = 0"
                    className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.solveBtn}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t.smartHelp}
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: General Form with Completing the Square */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{t.orientationLabel}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gen_orientation"
                  checked={genOrientation === 'horizontal'}
                  onChange={() => setGenOrientation('horizontal')}
                  className="accent-sky-600"
                />
                <span>{t.horizOpt}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gen_orientation"
                  checked={genOrientation === 'vertical'}
                  onChange={() => setGenOrientation('vertical')}
                  className="accent-sky-600"
                />
                <span>{t.vertOpt}</span>
              </label>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">{t.currentEq}</div>
              <MathView
                math={
                  genOrientation === 'horizontal'
                    ? `${genA || 'A'}y^2 + (${genB || 'B'})y + (${genC || 'C'})x + (${genD || 'D'}) = 0`
                    : `${genA || 'A'}x^2 + (${genB || 'B'})x + (${genC || 'C'})y + (${genD || 'D'}) = 0`
                }
                block
                className="text-lg font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.coeffA} ({genOrientation === 'horizontal' ? 'y²' : 'x²'})
                </label>
                <input
                  type="text"
                  value={genA}
                  onChange={(e) => setGenA(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.coeffB} ({genOrientation === 'horizontal' ? 'y' : 'x'})
                </label>
                <input
                  type="text"
                  value={genB}
                  onChange={(e) => setGenB(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.coeffC} ({genOrientation === 'horizontal' ? 'x' : 'y'})
                </label>
                <input
                  type="text"
                  value={genC}
                  onChange={(e) => setGenC(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.coeffD}
                </label>
                <input
                  type="text"
                  value={genD}
                  onChange={(e) => setGenD(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setGenA('1'); setGenB('-4'); setGenC('-8'); setGenD('12'); }}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleSolveGeneral}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{t.solveBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Standard Form */}
        {activeTab === 'standard' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{t.orientationLabel}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="std_orientation"
                  checked={stdOrientation === 'horizontal'}
                  onChange={() => setStdOrientation('horizontal')}
                  className="accent-sky-600"
                />
                <span><MathView math="y^2 = 2px" /> / <MathView math="y^2 = -2px" /></span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="std_orientation"
                  checked={stdOrientation === 'vertical'}
                  onChange={() => setStdOrientation('vertical')}
                  className="accent-sky-600"
                />
                <span><MathView math="x^2 = 2py" /> / <MathView math="x^2 = -2py" /></span>
              </label>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-center">
              <div className="text-xs text-slate-500 mb-1">{t.currentEq}</div>
              <MathView
                math={stdOrientation === 'horizontal' ? `y^2 = ${stdCoeff || 'k'}x` : `x^2 = ${stdCoeff || 'k'}y`}
                block
                className="text-lg font-semibold text-slate-900"
              />
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.coeffStd}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={stdCoeff}
                  onChange={(e) => setStdCoeff(e.target.value)}
                  placeholder="e.g. 8, -6, 4, 1/2"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSolveStandard}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>{t.solveBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Function Form */}
        {activeTab === 'function' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="func_orientation"
                  checked={funcOrientation === 'vertical'}
                  onChange={() => setFuncOrientation('vertical')}
                  className="accent-sky-600"
                />
                <span><MathView math="y = ax^2 + bx + c" /></span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="func_orientation"
                  checked={funcOrientation === 'horizontal'}
                  onChange={() => setFuncOrientation('horizontal')}
                  className="accent-sky-600"
                />
                <span><MathView math="x = ay^2 + by + c" /></span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  a (x² / y²)
                </label>
                <input
                  type="text"
                  value={funcA}
                  onChange={(e) => setFuncA(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  b (x / y)
                </label>
                <input
                  type="text"
                  value={funcB}
                  onChange={(e) => setFuncB(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  c (Constant)
                </label>
                <input
                  type="text"
                  value={funcC}
                  onChange={(e) => setFuncC(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSolveFunction}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{t.solveBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Error Banner */}
        {inputError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-700 flex items-center gap-2">
            <span className="font-bold">{t.errorTitle}</span>
            <span>{inputError}</span>
          </div>
        )}

        {/* Presets Grid */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              {t.presetsTitle}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={p.action}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 text-left transition-all group shadow-2xs"
              >
                <div className="text-[11px] text-slate-500 mb-1 font-medium">{p.badge}</div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                  <MathView math={p.latex} />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
