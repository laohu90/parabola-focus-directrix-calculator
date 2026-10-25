import React, { useState, useMemo } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { parseUniversalConic } from '../utils/equationParser.ts';
import { solveParabola, solveEllipse, solveHyperbola } from '../utils/conicSolver.ts';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import {
  Calculator,
  ArrowRight,
  RotateCcw,
  Flame,
  Sparkles,
  History,
  XCircle,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface ParabolaInputProps {
  onSolve: (result: ConicAnalysisResult, eqText?: string) => void;
  onError?: (errorMessage: string, rawInput: string) => void;
  currentResult: ConicAnalysisResult | null;
  lang: Language;
  onOpenHistory: () => void;
}

export const ParabolaInput: React.FC<ParabolaInputProps> = ({
  onSolve,
  onError,
  lang,
  onOpenHistory
}) => {
  const t = translations[lang].input;

  const [activeTab, setActiveTab] = useState<'smart' | 'parabola' | 'ellipse' | 'hyperbola'>('smart');
  const [naturalEq, setNaturalEq] = useState<string>('y^2 - 4y - 8x + 12 = 0');

  // Parabola form
  const [paraA, setParaA] = useState('1');
  const [paraB, setParaB] = useState('-4');
  const [paraC, setParaC] = useState('-8');
  const [paraD, setParaD] = useState('12');

  // Ellipse form: Ax^2 + By^2 + Cx + Dy + E = 0
  const [elA, setElA] = useState('4');
  const [elB, setElB] = useState('9');
  const [elC, setElC] = useState('-16');
  const [elD, setElD] = useState('18');
  const [elE, setElE] = useState('-11');

  // Hyperbola form: Ax^2 - By^2 + Cx + Dy + E = 0
  const [hyA, setHyA] = useState('4');
  const [hyB, setHyB] = useState('-9');
  const [hyC, setHyC] = useState('0');
  const [hyD, setHyD] = useState('0');
  const [hyE, setHyE] = useState('-36');

  const [inputError, setInputError] = useState<string | null>(null);

  // Live syntax parsing for instant visual feedback
  const livePreview = useMemo(() => {
    if (!naturalEq.trim()) return null;
    try {
      const parsed = parseUniversalConic(naturalEq, lang);
      return {
        valid: true,
        latex: parsed.standardLatex,
        type: parsed.conicType,
        error: null
      };
    } catch (err: any) {
      return { valid: false, latex: '', type: null, error: err.message };
    }
  }, [naturalEq, lang]);

  const parseNum = (str: string): number => {
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
    if (isNaN(val)) throw new Error(`"${str}" is invalid.`);
    return val;
  };

  const handleSolveSmart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setInputError(null);
      const res = parseUniversalConic(naturalEq, lang);
      onSolve(res, naturalEq.trim());
    } catch (err: any) {
      const errMsg = err.message || 'Error parsing equation.';
      setInputError(errMsg);
      if (onError) onError(errMsg, naturalEq.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNaturalEq(text.trim());
        setInputError(null);
      }
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setNaturalEq('');
    setInputError(null);
  };

  const handleInsertSymbol = (sym: string) => {
    setNaturalEq((prev) => prev + sym);
    setInputError(null);
  };

  const handleSolveParabolaForm = () => {
    try {
      setInputError(null);
      const a = parseNum(paraA);
      const b = parseNum(paraB);
      const c = parseNum(paraC);
      const d = parseNum(paraD);
      const res = solveParabola('horizontal', a, b, c, d, lang);
      const eqStr = `${paraA}y^2 + (${paraB})y + (${paraC})x + (${paraD}) = 0`;
      setNaturalEq(eqStr);
      onSolve(res, eqStr);
    } catch (err: any) {
      setInputError(err.message);
    }
  };

  const handleSolveEllipseForm = () => {
    try {
      setInputError(null);
      const a = parseNum(elA);
      const b = parseNum(elB);
      const c = parseNum(elC);
      const d = parseNum(elD);
      const e = parseNum(elE);
      const res = solveEllipse(a, b, c, d, e, lang);
      const eqStr = `${elA}x^2 + ${elB}y^2 + (${elC})x + (${elD})y + (${elE}) = 0`;
      setNaturalEq(eqStr);
      onSolve(res, eqStr);
    } catch (err: any) {
      setInputError(err.message);
    }
  };

  const handleSolveHyperbolaForm = () => {
    try {
      setInputError(null);
      const a = parseNum(hyA);
      const b = parseNum(hyB);
      const c = parseNum(hyC);
      const d = parseNum(hyD);
      const e = parseNum(hyE);
      const res = solveHyperbola(a, b, c, d, e, lang);
      const eqStr = `${hyA}x^2 + (${hyB})y^2 + (${hyC})x + (${hyD})y + (${hyE}) = 0`;
      setNaturalEq(eqStr);
      onSolve(res, eqStr);
    } catch (err: any) {
      setInputError(err.message);
    }
  };

  // Presets cleanly replace the input
  const presets = [
    {
      badge: lang === 'zh' ? '抛物线配方' : 'Parabola',
      latex: 'y^2 - 4y - 8x + 12 = 0',
      action: () => {
        setNaturalEq('y^2 - 4y - 8x + 12 = 0');
        setInputError(null);
        const res = solveParabola('horizontal', 1, -4, -8, 12, lang);
        onSolve(res, 'y^2 - 4y - 8x + 12 = 0');
      }
    },
    {
      badge: lang === 'zh' ? '椭圆标准式' : 'Ellipse Frac',
      latex: '\\frac{x^2}{25} + \\frac{y^2}{16} = 1',
      action: () => {
        setNaturalEq('x^2/25 + y^2/16 = 1');
        setInputError(null);
        const res = parseUniversalConic('x^2/25 + y^2/16 = 1', lang);
        onSolve(res, 'x^2/25 + y^2/16 = 1');
      }
    },
    {
      badge: lang === 'zh' ? '椭圆一般式配方' : 'Ellipse Square',
      latex: '4x^2 + 9y^2 - 16x + 18y - 11 = 0',
      action: () => {
        setNaturalEq('4x^2 + 9y^2 - 16x + 18y - 11 = 0');
        setInputError(null);
        const res = solveEllipse(4, 9, -16, 18, -11, lang);
        onSolve(res, '4x^2 + 9y^2 - 16x + 18y - 11 = 0');
      }
    },
    {
      badge: lang === 'zh' ? '双曲线标准式' : 'Hyperbola',
      latex: '\\frac{x^2}{16} - \\frac{y^2}{9} = 1',
      action: () => {
        setNaturalEq('x^2/16 - y^2/9 = 1');
        setInputError(null);
        const res = parseUniversalConic('x^2/16 - y^2/9 = 1', lang);
        onSolve(res, 'x^2/16 - y^2/9 = 1');
      }
    },
    {
      badge: lang === 'zh' ? 'Unicode输入' : 'Unicode y²',
      latex: 'y² = 8x',
      action: () => {
        setNaturalEq('y² = 8x');
        setInputError(null);
        const res = parseUniversalConic('y² = 8x', lang);
        onSolve(res, 'y² = 8x');
      }
    },
    {
      badge: lang === 'zh' ? '双曲线一般式' : 'Hyperbola Eq',
      latex: '4x^2 - 9y^2 = 36',
      action: () => {
        setNaturalEq('4x^2 - 9y^2 = 36');
        setInputError(null);
        const res = solveHyperbola(4, -9, 0, 0, -36, lang);
        onSolve(res, '4x^2 - 9y^2 = 36');
      }
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sky-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {lang === 'zh' ? '圆锥曲线智能输入' : 'Conic Section Smart Input'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <History className="w-4 h-4 text-sky-600" />
            <span>{lang === 'zh' ? '做题历史' : 'History'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
            <button
              onClick={() => { setActiveTab('smart'); setInputError(null); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'smart' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '智能自然输入' : 'Smart Input'}
            </button>
            <button
              onClick={() => { setActiveTab('parabola'); setInputError(null); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'parabola' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '抛物线' : 'Parabola'}
            </button>
            <button
              onClick={() => { setActiveTab('ellipse'); setInputError(null); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ellipse' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '椭圆' : 'Ellipse'}
            </button>
            <button
              onClick={() => { setActiveTab('hyperbola'); setInputError(null); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'hyperbola' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'zh' ? '双曲线' : 'Hyperbola'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* TAB 1: Smart Natural Equation Input */}
        {activeTab === 'smart' && (
          <form onSubmit={handleSolveSmart} className="space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-sm font-medium text-slate-800">
                  {lang === 'zh'
                    ? '输入或粘贴方程（支持 Unicode 上标 y²、x² 与 LaTeX 语法）：'
                    : 'Enter or paste equation (supports Unicode y², x² and LaTeX):'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Paste"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '粘贴' : 'Paste'}</span>
                  </button>
                  {naturalEq && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Clear"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '清空' : 'Clear'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Input Field with clear & submit buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={naturalEq}
                    onChange={(e) => {
                      setNaturalEq(e.target.value);
                      setInputError(null);
                    }}
                    placeholder="e.g. y² - 4y - 8x + 12 = 0  or  x^2/25 + y^2/16 = 1  or  4x² - 9y² = 36"
                    className="w-full px-4 py-2.5 pr-10 text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900 shadow-2xs"
                  />
                  {naturalEq && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.solveBtn}</span>
                </button>
              </div>

              {/* Quick Math Symbols Bar */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 mr-1">{lang === 'zh' ? '快捷符号：' : 'Symbols:'}</span>
                {['y²', 'x²', '²', '=', '+', '-', '/', '( )', '½'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleInsertSymbol(sym === '( )' ? '()' : sym)}
                    className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 rounded-md transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Real-Time Syntax Validation & LaTeX Preview */}
              {livePreview && livePreview.valid && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      {lang === 'zh' ? '已识别有效方程：' : 'Recognized Equation:'}
                    </span>
                    <MathView math={naturalEq} className="font-bold" />
                  </div>
                  <span className="font-mono uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    {livePreview.type}
                  </span>
                </div>
              )}

              {/* Real-Time In-flight Syntax Warning */}
              {livePreview && !livePreview.valid && naturalEq.trim() && !inputError && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{livePreview.error}</span>
                </div>
              )}

              {/* Submitted Input Error Alert Banner */}
              {inputError && (
                <div className="mt-3 p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-rose-900">
                      {lang === 'zh' ? '输入无法计算（格式或方程类型错误）：' : 'Invalid Conic Equation:'}
                    </span>
                    <p className="leading-relaxed font-medium">{inputError}</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: Parabola General Form */}
        {activeTab === 'parabola' && (
          <div className="space-y-4">
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              {lang === 'zh' ? '抛物线一般式配方法拆解：' : 'Parabola General Form:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">A (y²)</label>
                <input type="text" value={paraA} onChange={(e) => setParaA(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">B (y)</label>
                <input type="text" value={paraB} onChange={(e) => setParaB(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">C (x)</label>
                <input type="text" value={paraC} onChange={(e) => setParaC(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">D (Const)</label>
                <input type="text" value={paraD} onChange={(e) => setParaD(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSolveParabolaForm} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                <span>{t.solveBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Ellipse Form */}
        {activeTab === 'ellipse' && (
          <div className="space-y-4">
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              {lang === 'zh' ? '椭圆一般式配方法拆解：Ax² + By² + Cx + Dy + E = 0' : 'Ellipse General Form Completing the Square:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">A (x²)</label>
                <input type="text" value={elA} onChange={(e) => setElA(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">B (y²)</label>
                <input type="text" value={elB} onChange={(e) => setElB(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">C (x)</label>
                <input type="text" value={elC} onChange={(e) => setElC(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">D (y)</label>
                <input type="text" value={elD} onChange={(e) => setElD(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E (Const)</label>
                <input type="text" value={elE} onChange={(e) => setElE(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSolveEllipseForm} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                <span>{t.solveBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Hyperbola Form */}
        {activeTab === 'hyperbola' && (
          <div className="space-y-4">
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              {lang === 'zh' ? '双曲线一般式配方法拆解：Ax² + By² + Cx + Dy + E = 0 (A·B < 0)' : 'Hyperbola General Form Completing the Square:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">A (x²)</label>
                <input type="text" value={hyA} onChange={(e) => setHyA(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">B (y²)</label>
                <input type="text" value={hyB} onChange={(e) => setHyB(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">C (x)</label>
                <input type="text" value={hyC} onChange={(e) => setHyC(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">D (y)</label>
                <input type="text" value={hyD} onChange={(e) => setHyD(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E (Const)</label>
                <input type="text" value={hyE} onChange={(e) => setHyE(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSolveHyperbolaForm} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
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
              {lang === 'zh'
                ? '圆锥曲线经典真题库（抛物线 / 椭圆 / 双曲线 / Unicode / LaTeX）：'
                : 'Conic Sections Curated Problem Bank (Parabola, Ellipse, Hyperbola, LaTeX):'}
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
                <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 truncate">
                  <MathView math={p.latex} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
