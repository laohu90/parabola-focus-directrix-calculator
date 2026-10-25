import React, { useState, useRef, useEffect } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { formatFractionLaTeX } from '../utils/fraction.ts';
import { MathView } from './MathView.tsx';
import { PrintPdfModal } from './PrintPdfModal.tsx';
import { isEquationBookmarked, toggleBookmarkEquation } from '../utils/historyManager.ts';
import { Language, translations } from '../i18n/translations.ts';
import {
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
  BookOpen,
  Printer,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  ListOrdered,
  Crosshair,
  Star,
  X
} from 'lucide-react';

interface StepsSolutionViewProps {
  conic: ConicAnalysisResult;
  lang: Language;
  onViewGraph?: () => void;
  onBookmarkChanged?: () => void;
  onOpenBookmarks?: () => void;
}

const copyToastMessages: Record<Language, { title: string; desc: string; buttonCopied: string }> = {
  zh: {
    title: '完整解题报告已成功复制到剪贴板！',
    desc: '包含标准方程、核心几何参量（焦点/准线/通径）及配方法详细推导步骤。可直接粘贴至草稿纸、Word 或学习交流群。',
    buttonCopied: '已复制解题报告！'
  },
  en: {
    title: 'Full Solution Report Copied to Clipboard!',
    desc: 'Includes standard equation, key parameters (foci/directrix/latus rectum), and completing-the-square steps.',
    buttonCopied: 'Solution Copied!'
  },
  es: {
    title: '¡Informe de solución copiado al portapapeles!',
    desc: 'Incluye la ecuación canónica, parámetros geométricos clave y los pasos completos de deducción.',
    buttonCopied: '¡Copiado con éxito!'
  },
  fr: {
    title: 'Rapport complet copié dans le presse-papiers !',
    desc: 'Comprend la forme canonique, les foyers/directrice et les étapes détaillées de complétion du carré.',
    buttonCopied: 'Rapport copié !'
  },
  pt: {
    title: 'Relatório completo copiado para a área de transferência!',
    desc: 'Inclui a equação padrão, parâmetros geométricos e etapas detalhadas de resolução.',
    buttonCopied: 'Copiado com sucesso!'
  }
};

export const StepsSolutionView: React.FC<StepsSolutionViewProps> = ({
  conic,
  lang,
  onViewGraph,
  onBookmarkChanged,
  onOpenBookmarks
}) => {
  const tSummary = translations[lang].summary;
  const tSteps = translations[lang].steps;
  const toastText = copyToastMessages[lang] || copyToastMessages.en;

  const [copied, setCopied] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  // Bookmark state tracking
  const currentEqKey = conic.rawEquation || conic.standardLatex;
  const [bookmarked, setBookmarked] = useState<boolean>(() =>
    isEquationBookmarked(currentEqKey)
  );
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  useEffect(() => {
    setBookmarked(isEquationBookmarked(currentEqKey));
  }, [currentEqKey]);

  const handleToggleBookmark = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { isBookmarked } = toggleBookmarkEquation(currentEqKey, conic.conicType);
    setBookmarked(isBookmarked);
    const msg = isBookmarked
      ? (lang === 'zh' ? '★ 已将本题加入书签收藏库！可在顶部“书签”随时重练' : '★ Added to Bookmarks! Accessible from top nav')
      : (lang === 'zh' ? '已从书签收藏库移除' : 'Removed from Bookmarks');
    setBookmarkToast(msg);
    setTimeout(() => setBookmarkToast(null), 3000);
    if (onBookmarkChanged) {
      onBookmarkChanged();
    }
  };

  const [viewMode, setViewMode] = useState<'all' | 'stepper'>('all');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });

  const toggleWhy = (idx: number) => {
    setExpandedWhy((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const executeClipboardCopy = async (str: string): Promise<boolean> => {
    let ok = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(str);
        ok = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, attempting execCommand fallback...', err);
      }
    }
    if (!ok && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = str;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        ok = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        console.error('Fallback execCommand copy failed', e);
      }
    }
    // Trigger subtle haptic on mobile if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
    return ok;
  };

  // Instant synchronous feedback on copy click - 0ms response time
  const copySummary = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. INSTANT SYNCHRONOUS FEEDBACK
    setCopied(true);
    setShowToast(true);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 4000);

    // 2. Perform copy safely
    setTimeout(async () => {
      try {
        const conicTypeLabels: Record<string, string> = {
          parabola: lang === 'zh' ? '抛物线' : 'Parabola',
          ellipse: lang === 'zh' ? '椭圆' : 'Ellipse',
          hyperbola: lang === 'zh' ? '双曲线' : 'Hyperbola'
        };

        let text = `========================================\n`;
        text += `【${lang === 'zh' ? '圆锥曲线解析几何解题与配方报告' : 'Conic Section Analytic Geometry & Solution Report'}】\n`;
        text += `========================================\n\n`;
        text += `${lang === 'zh' ? '曲线类型' : 'Conic Type'}: ${conicTypeLabels[conic.conicType] || conic.conicType.toUpperCase()}\n`;
        text += `${lang === 'zh' ? '标准方程' : 'Standard Equation'}: ${conic.standardLatex}\n`;
        if (conic.rawEquation) {
          text += `${lang === 'zh' ? '输入方程' : 'Input Equation'}: ${conic.rawEquation}\n`;
        }
        text += `\n----------------------------------------\n`;
        text += `${lang === 'zh' ? '【核心几何特征量】' : '【KEY GEOMETRIC PARAMETERS】'}\n`;
        text += `• ${conic.conicType === 'parabola' ? (lang === 'zh' ? '顶点坐标 V' : 'Vertex V') : (lang === 'zh' ? '中心坐标 O' : 'Center O')}: (${conic.centerOrVertex.x}, ${conic.centerOrVertex.y})\n`;
        text += `• ${lang === 'zh' ? '焦点坐标 F' : 'Foci F'}: ${conic.foci.map((f) => `${f.label}(${f.x}, ${f.y})`).join(', ')}\n`;
        text += `• ${tSummary.eccentricity}: ${conic.eccentricity.latex} (${conic.conicType === 'parabola' ? 'e = 1' : conic.conicType === 'ellipse' ? '0 < e < 1' : 'e > 1'})\n`;
        text += `• ${tSummary.latusRectum}: ${conic.latusRectum.latex} ≈ ${conic.latusRectum.val.toFixed(2).replace(/\.00$/, '')}\n`;
        if (conic.directrices.length > 0) {
          text += `• ${tSummary.directrix}: ${conic.directrices.map((d) => d.latex).join('; ')}\n`;
        }
        if (conic.asymptotes && conic.asymptotes.length > 0) {
          text += `• ${lang === 'zh' ? '渐近线' : 'Asymptotes'}: ${conic.asymptotes.map((a) => a.latex).join(', ')}\n`;
        }
        text += `• ${tSummary.domain}: x in ${conic.domainLatex}\n`;
        text += `• ${tSummary.range}: y in ${conic.rangeLatex}\n`;

        text += `\n----------------------------------------\n`;
        text += `${lang === 'zh' ? '【配方法详细推导步骤】' : '【STEP-BY-STEP COMPLETING THE SQUARE DERIVATION】'}\n`;
        conic.steps.forEach((step, idx) => {
          text += `\n[${lang === 'zh' ? '第 ' + (idx + 1) + ' 步' : 'Step ' + (idx + 1)}] ${step.title}\n`;
          text += `   ${lang === 'zh' ? '数学表达式' : 'Formula'}: ${step.math}\n`;
          if (step.note) {
            text += `   ${lang === 'zh' ? '说明' : 'Note'}: ${step.note}\n`;
          }
          if (step.whyExplanation) {
            text += `   ${lang === 'zh' ? '为什么这样做' : 'Why'}: ${step.whyExplanation}\n`;
          }
        });

        text += `\n========================================\n`;
        text += `${lang === 'zh' ? '求解器网址' : 'Generated by'}: https://parabola-focus-directrix-calculator.formulacalckit.com\n`;

        await executeClipboardCopy(text);
      } catch (err) {
        console.warn('Background copy error:', err);
      }
    }, 0);
  };

  const copySingleLatex = (latexStr: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
    setTimeout(() => {
      executeClipboardCopy(latexStr);
    }, 0);
  };

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      window.print();
    } catch (err) {
      console.warn('Native window.print failed in current context:', err);
    }
    // Open dedicated Print & PDF Export modal so users in iframes / test environments can export & print seamlessly!
    setShowPrintModal(true);
  };

  const scrollToStep = (idx: number) => {
    if (viewMode === 'stepper') {
      setCurrentStepIdx(idx);
    } else {
      const el = document.getElementById(`step-card-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-sky-500');
        setTimeout(() => el.classList.remove('ring-2', 'ring-sky-500'), 1200);
      }
    }
  };

  const conicTypeNames: Record<string, string> = {
    parabola: lang === 'zh' ? '抛物线' : 'Parabola',
    ellipse: lang === 'zh' ? '椭圆' : 'Ellipse',
    hyperbola: lang === 'zh' ? '双曲线' : 'Hyperbola'
  };

  const conicColors: Record<string, string> = {
    parabola: 'text-sky-700 bg-sky-50 border-sky-200',
    ellipse: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    hyperbola: 'text-purple-700 bg-purple-50 border-purple-200'
  };

  const totalSteps = conic.steps.length;

  return (
    <div className="space-y-6">
      {/* High-visibility Floating Center Toast Notification when Solution is copied */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3.5 bg-slate-900/98 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 max-w-lg w-[92vw] sm:w-auto animate-fadeIn print:hidden"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">
                {toastText.title}
              </span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                {lang === 'zh' ? '已复制' : 'Copied'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {toastText.desc}
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bookmark Toast Notification */}
      {bookmarkToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 bg-amber-950/95 backdrop-blur-md text-amber-100 px-5 py-3 rounded-xl shadow-2xl border border-amber-400 animate-fadeIn print:hidden"
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{bookmarkToast}</span>
        </div>
      )}

      {/* Printable Document Header (Only shown during printing / PDF export) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'zh' ? '圆锥曲线解析几何解题与配方报告' : 'Conic Section Step-by-Step Analytic Geometry Report'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {lang === 'zh' ? '公式计算器在线平台' : 'Online Conic & Parabola Solver'}: https://parabola-focus-directrix-calculator.formulacalckit.com
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div className="font-bold text-slate-900">{new Date().toLocaleDateString()}</div>
            <div className="uppercase font-semibold text-slate-700">{conicTypeNames[conic.conicType]}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-300">
          <div>
            <strong className="text-slate-800">{lang === 'zh' ? '输入方程' : 'Input Equation'}:</strong>{' '}
            <span className="font-mono">{conic.rawEquation || conic.standardLatex}</span>
          </div>
          <div>
            <strong className="text-slate-800">{lang === 'zh' ? '标准方程' : 'Standard Form'}:</strong>{' '}
            <span className="font-mono">{conic.standardLatex}</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        {/* Inline copy feedback banner */}
        {copied && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastText.title}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-normal">
              {lang === 'zh' ? '已包含全部配方演算步骤' : 'Full steps included'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {tSummary.title}
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ml-2 ${
                conicColors[conic.conicType]
              }`}
            >
              {conicTypeNames[conic.conicType]}
            </span>
          </div>

          <div className="flex items-center gap-2 print-hide relative">
            {/* 1. Bookmark Button */}
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                bookmarked
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 ring-2 ring-amber-300/80 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
              title={bookmarked ? (lang === 'zh' ? '已收藏（点击取消）' : 'Bookmarked') : (lang === 'zh' ? '收藏本题到书签' : 'Bookmark this problem')}
            >
              <Star
                className={`w-4 h-4 ${
                  bookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-500'
                }`}
              />
              <span>{bookmarked ? (lang === 'zh' ? '已收藏' : 'Bookmarked') : (lang === 'zh' ? '收藏本题' : 'Bookmark')}</span>
            </button>

            {/* 2. Popover Tooltip Badge directly over the copy button */}
            {copied && (
              <div className="absolute -top-11 right-12 sm:right-28 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-1.5 z-40 whitespace-nowrap animate-fadeIn border border-emerald-400">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>{lang === 'zh' ? '已复制！' : 'Copied!'}</span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-emerald-400" />
              </div>
            )}
            <button
              onClick={copySummary}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 ring-4 ring-emerald-300/70 shadow-md scale-105'
                  : 'text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
              title={lang === 'zh' ? '复制完整解题步骤与参数' : 'Copy full solution report'}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-pulse" />
                  <span className="font-bold text-white">{toastText.buttonCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{tSummary.copyBtn}</span>
                </>
              )}
            </button>

            {/* 3. Print / PDF Export Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              title={lang === 'zh' ? '打印或导出 PDF 导学案' : 'Print or Export PDF Study Sheet'}
            >
              <Printer className="w-4 h-4" />
              <span>{tSummary.printBtn}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards based on Conic Type */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Center / Vertex */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              {conic.conicType === 'parabola' ? (lang === 'zh' ? '顶点坐标 V' : 'Vertex V') : (lang === 'zh' ? '中心坐标 O' : 'Center O')}
            </div>
            <div className="font-bold text-slate-900 text-base sm:text-lg">
              <MathView
                math={`${conic.centerOrVertex.label}\\left(${formatFractionLaTeX(conic.centerOrVertex.xFrac)},\\ ${formatFractionLaTeX(conic.centerOrVertex.yFrac)}\\right)`}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              ({conic.centerOrVertex.x.toFixed(2).replace(/\.00$/, '')}, {conic.centerOrVertex.y.toFixed(2).replace(/\.00$/, '')})
            </div>
          </div>

          {/* Card 2: Foci */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{lang === 'zh' ? '焦点坐标 F' : 'Foci F'}</div>
            <div className="font-bold text-purple-700 text-sm sm:text-base">
              {conic.foci.map((f, idx) => (
                <div key={idx}>
                  <MathView math={`${f.label}\\left(${formatFractionLaTeX(f.xFrac)}, ${formatFractionLaTeX(f.yFrac)}\\right)`} />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Eccentricity */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.eccentricity}</div>
            <div className="font-bold text-slate-900 text-base sm:text-lg">
              <MathView math={conic.eccentricity.latex} />
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {conic.conicType === 'parabola' ? 'e = 1' : conic.conicType === 'ellipse' ? '0 < e < 1' : 'e > 1'}
            </div>
          </div>

          {/* Card 4: Latus Rectum */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.latusRectum}</div>
            <div className="font-bold text-amber-700 text-base sm:text-lg">
              <MathView math={conic.latusRectum.latex} />
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              ≈ {conic.latusRectum.val.toFixed(2).replace(/\.00$/, '')}
            </div>
          </div>

          {/* Card 5: Directrix */}
          {conic.directrices.length > 0 && (
            <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.directrix}</div>
              <div className="font-bold text-rose-700 text-sm sm:text-base">
                {conic.directrices.map((d, idx) => (
                  <div key={idx}>
                    <MathView math={d.latex} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 6: Asymptotes for Hyperbola */}
          {conic.asymptotes && conic.asymptotes.length > 0 && (
            <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 sm:col-span-2">
              <div className="text-xs font-semibold text-slate-500 mb-1">{lang === 'zh' ? '双曲线渐近线方程' : 'Asymptotes'}</div>
              <div className="font-bold text-indigo-700 text-xs sm:text-sm space-y-1">
                {conic.asymptotes.map((a, idx) => (
                  <div key={idx}>
                    <MathView math={a.latex} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 7: Domain & Range */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.domain} & {tSummary.range}</div>
            <div className="text-xs sm:text-sm text-slate-900 space-y-0.5">
              <div>{tSummary.domain}: <MathView math={`x \\in ${conic.domainLatex}`} /></div>
              <div>{tSummary.range}: <MathView math={`y \\in ${conic.rangeLatex}`} /></div>
            </div>
          </div>
        </div>

        {/* Standard Form Banner with Quick LaTeX Copy */}
        <div className="mt-4 p-4 rounded-lg bg-sky-50/60 border border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-sky-900">{tSummary.standardEq}:</span>
            <MathView math={conic.standardLatex} className="text-base sm:text-lg font-bold" />
          </div>

          <button
            onClick={() => copySingleLatex(conic.standardLatex)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 print-hide shadow-2xs ${
              copiedLatex
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200'
            }`}
            title="Copy LaTeX"
          >
            {copiedLatex ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{lang === 'zh' ? '已复制 LaTeX！' : 'LaTeX Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '复制 LaTeX' : 'Copy LaTeX'}</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Graph Callout Banner */}
        <div className="mt-3 p-3.5 rounded-lg bg-gradient-to-r from-purple-50 via-sky-50 to-emerald-50 border border-purple-200/70 flex flex-wrap items-center justify-between gap-3 print-hide">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                {lang === 'zh'
                  ? '已绘制焦点与准线几何坐标图（含通径与 p/2 标尺）'
                  : 'Coordinate Graph Live: Focus F, Directrix l & Latus Rectum'}
              </span>
              <span className="text-[11px] text-slate-600">
                {lang === 'zh'
                  ? '直观几何呈现，支持鼠标滚轮缩放、拖拽平移、动点 P 实时验证'
                  : 'Visual geometric plot with wheel zoom, drag to pan and Point P proof'}
              </span>
            </div>
          </div>
          {onViewGraph && (
            <button
              onClick={onViewGraph}
              className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-white hover:bg-purple-50 border border-purple-300 rounded-lg shadow-2xs transition-colors shrink-0"
            >
              {lang === 'zh' ? '全屏查看坐标图 →' : 'View Full Graph →'}
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Completing the Square Breakdown with Step Navigator & Stepper Mode */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Step Breakdown Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {tSteps.title}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'zh'
                  ? '包含“每一步在做什么”与深度“为什么这样做”（数学原理与考场丢分点拆解）'
                  : 'Includes both "What to do" and in-depth "Why do this" (Mathematical rationale & exam scoring logic)'}
              </p>
            </div>
          </div>

          {/* View Mode Switcher: All Steps vs Guided Stepper */}
          <div className="flex items-center gap-2 print-hide">
            <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'zh' ? '全卷总览' : 'All Steps'}
              </button>
              <button
                onClick={() => {
                  setViewMode('stepper');
                  setCurrentStepIdx(0);
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'stepper'
                    ? 'bg-white text-sky-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'zh' ? '逐步推导演练' : 'Step-by-Step Guided'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Step Jump Navigation Bar (Horizontal Pills) */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto print-hide scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
            <ListOrdered className="w-3.5 h-3.5" />
            {lang === 'zh' ? '步骤直达：' : 'Jump to:'}
          </span>
          <div className="flex items-center gap-1.5">
            {conic.steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => scrollToStep(idx)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                  viewMode === 'stepper' && currentStepIdx === idx
                    ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs'
                    : step.highlight
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={step.title}
              >
                <span className="font-bold mr-1">{idx + 1}.</span>
                {step.title.split('：')[0].replace(/^第[一二三四五六七八九十]+步/, '') || step.title}
                {step.highlight && ' ★'}
              </button>
            ))}
          </div>
        </div>

        {/* MODE 1: ALL STEPS VIEW (always rendered in print mode, and visible on screen when viewMode === 'all') */}
        <div className={`divide-y divide-slate-100 ${viewMode !== 'all' ? 'hidden print:block' : ''}`}>
          {conic.steps.map((step, idx) => (
            <div
              key={idx}
              id={`step-card-${idx}`}
              className={`step-card p-4 sm:p-5 transition-all rounded-none ${
                step.highlight ? 'bg-sky-50/30' : 'hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h4>
                </div>
                {step.highlight && (
                  <span className="text-xs font-semibold text-sky-700 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                    {tSteps.coreBadge}
                  </span>
                )}
              </div>

              <div className="pl-8 sm:pl-8 space-y-2.5">
                <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 my-2 shadow-2xs">
                  <MathView math={step.math} block className="text-base sm:text-lg" />
                </div>

                {step.note && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {step.note}
                  </p>
                )}

                {/* Expandable Pedagogical "WHY" block */}
                {step.whyExplanation && (
                  <div className="rounded-lg bg-amber-50/70 border border-amber-200/90 p-3 sm:p-3.5 text-xs sm:text-sm text-amber-950">
                    <div
                      onClick={() => toggleWhy(idx)}
                      className="flex items-center justify-between cursor-pointer font-bold text-amber-900 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{lang === 'zh' ? '为什么这样做？（数学原理与考点剖析）' : 'Why do this? (Mathematical Rationale)'}</span>
                      </div>
                      <span className="text-xs text-amber-700 font-semibold print-hide">
                        {expandedWhy[idx] ? (lang === 'zh' ? '收起' : 'Hide') : (lang === 'zh' ? '展开详解' : 'Show')}
                      </span>
                    </div>

                    {(expandedWhy[idx] || typeof window === 'undefined') && (
                      <p className="mt-2 text-amber-900/90 leading-relaxed border-t border-amber-200/60 pt-2 animate-fadeIn print-expand">
                        {step.whyExplanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODE 2: STEPPER / GUIDED STEP-BY-STEP VIEW */}
        {viewMode === 'stepper' && (
          <div className="p-5 sm:p-6 space-y-5 print:hidden">
            {/* Stepper Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  {lang === 'zh' ? `推导进度：第 ${currentStepIdx + 1} 步 / 共 ${totalSteps} 步` : `Step ${currentStepIdx + 1} of ${totalSteps}`}
                </span>
                <span className="font-mono text-sky-700 font-bold">
                  {Math.round(((currentStepIdx + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step Card */}
            {conic.steps[currentStepIdx] && (
              <div className="border border-sky-100 rounded-xl p-5 bg-sky-50/20 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {currentStepIdx + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      {conic.steps[currentStepIdx].title}
                    </h4>
                  </div>
                  {conic.steps[currentStepIdx].highlight && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {tSteps.coreBadge}
                    </span>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                  <MathView math={conic.steps[currentStepIdx].math} block className="text-lg sm:text-xl" />
                </div>

                {conic.steps[currentStepIdx].note && (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {conic.steps[currentStepIdx].note}
                  </p>
                )}

                {/* Educational Why Box */}
                {conic.steps[currentStepIdx].whyExplanation && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950">
                    <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{lang === 'zh' ? '为什么这样做？（数学原理与考点剖析）' : 'Why do this? (Mathematical Rationale)'}</span>
                    </div>
                    <p className="text-amber-900/90 leading-relaxed border-t border-amber-200/60 pt-2">
                      {conic.steps[currentStepIdx].whyExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'zh' ? '上一步' : 'Previous Step'}</span>
              </button>

              <button
                onClick={() => setViewMode('all')}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                {lang === 'zh' ? '切换为全卷展示' : 'View All Steps'}
              </button>

              {currentStepIdx < totalSteps - 1 ? (
                <button
                  onClick={() => setCurrentStepIdx((i) => Math.min(totalSteps - 1, i + 1))}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-xs"
                >
                  <span>{lang === 'zh' ? '下一步' : 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setViewMode('all')}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'zh' ? '完成！查看全卷' : 'Completed!'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Print & PDF Export Modal */}
      <PrintPdfModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        conic={conic}
        lang={lang}
      />
    </div>
  );
};

