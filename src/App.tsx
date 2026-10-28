import React, { useState, useEffect } from 'react';
import { ConicAnalysisResult } from './utils/conicTypes.ts';
import { solveParabola } from './utils/conicSolver.ts';
import { parseUniversalConic } from './utils/equationParser.ts';
import { getHistory, saveHistoryItem, HistoryItem } from './utils/historyManager.ts';
import { ParabolaInput } from './components/ParabolaInput.tsx';
import { StepsSolutionView } from './components/StepsSolutionView.tsx';
import { ParabolaCanvas } from './components/ParabolaCanvas.tsx';
import { OpeningDirectionGuide } from './components/OpeningDirectionGuide.tsx';
import { ParabolaQuiz } from './components/ParabolaQuiz.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { KeywordTags } from './components/KeywordTags.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { MathView } from './components/MathView.tsx';
import { Language, translations } from './i18n/translations.ts';
import {
  Compass,
  BookOpen,
  Sparkles,
  GraduationCap,
  Globe,
  History,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  Star,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Support URL search params (e.g. ?lang=es or ?eq=y^2=8x) for Google crawler & sharing
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as Language;
      if (urlLang && ['en', 'es', 'fr', 'pt', 'zh'].includes(urlLang)) {
        return urlLang;
      }
    }
    return 'en';
  });

  const [currentEqStr, setCurrentEqStr] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEq = params.get('eq');
      if (urlEq) return urlEq;
    }
    return 'y^2 - 4y - 8x + 12 = 0';
  });

  // Default problem or from URL ?eq=...
  const [currentResult, setCurrentResult] = useState<ConicAnalysisResult>(() => {
    const initialLang = (() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang') as Language;
        if (urlLang && ['en', 'es', 'fr', 'pt', 'zh'].includes(urlLang)) return urlLang;
      }
      return 'en';
    })();
    try {
      return parseUniversalConic(currentEqStr, initialLang);
    } catch {
      return solveParabola('horizontal', 1, -4, -8, 12, initialLang);
    }
  });

  // History and Bookmarks state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDrawerTab, setHistoryDrawerTab] = useState<'all' | 'bookmarks'>('all');
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => getHistory());

  // View mode tab for Section 2: 'both' (side-by-side), 'graph' (graph visualization first), 'steps' (detailed steps first)
  const [stageTab, setStageTab] = useState<'both' | 'graph' | 'steps'>('both');

  // Explicit calculation error state when user enters non-conic, linear or invalid strings (e.g. 'abc', 'x + y = 1')
  const [solveError, setSolveError] = useState<{ message: string; rawInput: string } | null>(null);

  // Responsive mobile/laptop header navigation collapse
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[lang];

  // Update document title, html lang, and URL search param on language change
  useEffect(() => {
    document.title = t.meta.title;
    document.documentElement.lang = lang;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('lang') !== lang) {
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [lang, t]);

  // Force full recalculation and re-rendering of solution when language changes
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    const eqToSolve = currentEqStr || currentResult.rawEquation || currentResult.standardLatex;
    if (eqToSolve) {
      try {
        const re = parseUniversalConic(eqToSolve, newLang);
        setCurrentResult(re);
        setSolveError(null);
      } catch (err: any) {
        // If current string had an error, update error text in new language
        setSolveError({ message: err.message, rawInput: eqToSolve });
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSolve = (result: ConicAnalysisResult, eqText?: string) => {
    const finalEq = eqText || result.rawEquation || result.standardLatex;
    setCurrentEqStr(finalEq);
    const finalResult = { ...result, rawEquation: finalEq };
    setCurrentResult(finalResult);
    setSolveError(null); // Clear any previous error

    // Save to history
    if (finalEq) {
      const updated = saveHistoryItem(finalEq, result.conicType);
      setHistoryList(updated);
    }

    // Sync to URL
    if (typeof window !== 'undefined' && finalEq) {
      const url = new URL(window.location.href);
      url.searchParams.set('eq', finalEq);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSolveError = (errorMessage: string, rawInput: string) => {
    setSolveError({ message: errorMessage, rawInput });
  };

  const handleQuickLoad = (eqStr: string) => {
    try {
      const res = parseUniversalConic(eqStr, lang);
      handleSolve(res, eqStr);
    } catch {
      // fallback
    }
  };

  const handleTagClick = (tag: string) => {
    scrollToSection('solver-section');
    if (tag.includes('y² = 2px') || tag.includes('y^2')) {
      const res = parseUniversalConic('y^2 = 8x', lang);
      handleSolve(res, 'y^2 = 8x');
    } else if (tag.includes('x-h') || tag.includes('completar') || tag.includes('complétion') || tag.includes('配方')) {
      const res = parseUniversalConic('y^2 - 4y - 8x + 12 = 0', lang);
      handleSolve(res, 'y^2 - 4y - 8x + 12 = 0');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar with Responsive Collapsible Menu */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 print-hide w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 sm:gap-x-4 min-w-0">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-none">
              {lang === 'zh' ? '圆锥曲线与抛物线焦点求解器' : 'Conic Sections & Parabola Solver'}
            </span>
          </div>

          {/* Zone 2: Navigation Links (Desktop 1280px+) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs 2xl:text-sm font-semibold text-slate-600 min-w-0">
            <button
              onClick={() => scrollToSection('solver-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-left"
            >
              {t.nav.steps}
            </button>
            <button
              onClick={() => scrollToSection('canvas-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-left"
            >
              {t.nav.canvas}
            </button>
            <button
              onClick={() => scrollToSection('guide-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-left"
            >
              {t.nav.rules}
            </button>
            <button
              onClick={() => scrollToSection('quiz-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-left"
            >
              {t.nav.quiz}
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-left"
            >
              {t.nav.faq}
            </button>
          </nav>

          {/* Zone 3: Language Selector, History, Bookmarks & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Bookmarks Toggle Button */}
            <button
              onClick={() => {
                setHistoryDrawerTab('bookmarks');
                setHistoryOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
              title={lang === 'zh' ? '我的书签收藏' : 'Bookmarks'}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="hidden md:inline">{lang === 'zh' ? '书签' : 'Bookmarks'}</span>
              {historyList.filter((i) => i.starred).length > 0 && (
                <span className="bg-amber-500 text-white rounded-full px-1.5 text-[10px] font-bold">
                  {historyList.filter((i) => i.starred).length}
                </span>
              )}
            </button>

            {/* History Toggle Button */}
            <button
              onClick={() => {
                setHistoryDrawerTab('all');
                setHistoryOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
              title={lang === 'zh' ? '做题历史' : 'History'}
            >
              <History className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">{lang === 'zh' ? '历史' : 'History'}</span>
              {historyList.length > 0 && (
                <span className="bg-sky-600 text-white rounded-full px-1.5 text-[10px] font-bold">
                  {historyList.length}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 sm:p-1 border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer pr-1"
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <button
              onClick={() => scrollToSection('solver-section')}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.nav.startBtn}</span>
            </button>

            {/* Mobile / Laptop Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Responsive Collapsible Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200/80 bg-white/98 px-4 py-3 shadow-md animate-fadeIn flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <button
              onClick={() => {
                scrollToSection('solver-section');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.nav.steps}
            </button>
            <button
              onClick={() => {
                scrollToSection('canvas-section');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.nav.canvas}
            </button>
            <button
              onClick={() => {
                scrollToSection('guide-section');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.nav.rules}
            </button>
            <button
              onClick={() => {
                scrollToSection('quiz-section');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.nav.quiz}
            </button>
            <button
              onClick={() => {
                scrollToSection('faq-section');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.nav.faq}
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-2 pb-2 print-hide">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 mb-3">
            <span>{lang === 'zh' ? '抛物线 · 椭圆 · 双曲线' : 'Parabola · Ellipse · Hyperbola'}</span>
            <span aria-hidden="true">·</span>
            <span>{t.meta.badge2}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'zh' ? '深度原理“为什么”解析' : 'In-depth "Why" Rationales'}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'zh' ? '支持 y² 上标与 LaTeX' : 'Unicode y² & LaTeX'}</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4"
            style={{ textWrap: 'balance' }}
          >
            {lang === 'zh'
              ? '圆锥曲线全能求解器 · 配方法深度拆解'
              : 'Conic Sections & Parabola Solver | Full Step-by-Step Rationale'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {lang === 'zh'
              ? '覆盖抛物线、椭圆与双曲线完整解析几何知识体系。独创“为什么这样做”数学原理解析，深度拆解配方法、开口方向、渐近线与离心率。'
              : 'Comprehensive analytic geometry solver for Parabolas, Ellipses, and Hyperbolas. Features pedagogical "Why do this" explanations and interactive coordinate proof.'}
          </p>
        </section>

        {/* Section 1: Input & Presets */}
        <section id="solver-section" className="print-hide">
          <ParabolaInput
            onSolve={handleSolve}
            onError={handleSolveError}
            currentResult={currentResult}
            lang={lang}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        </section>

        {/* Section 2: Two-Zone Interactive Stage or Error Screen */}
        <section id="canvas-section" className="space-y-4">
          {solveError ? (
            <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {lang === 'zh' ? '输入无法计算：非有效圆锥曲线方程' : 'Calculation Failed: Invalid Conic Equation'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {lang === 'zh'
                      ? '本求解器专注于抛物线、椭圆与双曲线的配方法拆解与坐标计算，需输入二次方程。'
                      : 'This solver specifically analyzes quadratic conic sections (parabolas, ellipses, hyperbolas).'}
                  </p>
                </div>
              </div>

              {/* Error Detail Box */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-semibold">
                  <span>{lang === 'zh' ? '您当前输入：' : 'Your Input:'}</span>
                  <code className="bg-rose-100 px-2 py-0.5 rounded font-mono font-bold text-rose-800">
                    {solveError.rawInput}
                  </code>
                </div>
                <div className="text-rose-700 font-medium">
                  <strong>{lang === 'zh' ? '错误原因：' : 'Reason: '}</strong>
                  {solveError.message}
                </div>
              </div>

              {/* Why this is an error explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm space-y-2 text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>{lang === 'zh' ? '圆锥曲线输入规范与数学原理说明' : 'Conic Section Input Guidelines'}</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-600">
                  <li>
                    {lang === 'zh'
                      ? '一次方程（如 x + y = 1 或 2x - 3y = 0）在平面解析几何中严格表示直线，缺少二次项，因而没有焦点、准线或配方法拆解。'
                      : 'Linear equations (e.g. x + y = 1) represent straight lines, with no focus, directrix or completing-the-square.'}
                  </li>
                  <li>
                    {lang === 'zh'
                      ? '任意圆锥曲线（抛物线、椭圆、双曲线）的最高次数必须为二次，至少包含 x² 或 y²。'
                      : 'All conic sections must have degree 2 with at least one x² or y² term.'}
                  </li>
                  <li>
                    {lang === 'zh'
                      ? '请勿输入非数学英文字母（如 abc、foo）或无变量等式。'
                      : 'Do not enter non-mathematical text or expressions without variables.'}
                  </li>
                </ul>
              </div>

              {/* One-Click Recovery Buttons */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  {lang === 'zh' ? '立即载入标准真题试算（一键恢复）：' : 'Click to load a valid exam problem:'}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleQuickLoad('y^2 - 4y - 8x + 12 = 0')}
                    className="px-3.5 py-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{lang === 'zh' ? '抛物线配方: y² - 4y - 8x + 12 = 0' : 'Parabola: y² - 4y - 8x + 12 = 0'}</span>
                  </button>
                  <button
                    onClick={() => handleQuickLoad('y^2 = 8x')}
                    className="px-3.5 py-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>{lang === 'zh' ? '标准抛物线: y² = 8x' : 'Standard Parabola: y² = 8x'}</span>
                  </button>
                  <button
                    onClick={() => handleQuickLoad('x^2/25 + y^2/16 = 1')}
                    className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'zh' ? '椭圆标准方程: x²/25 + y²/16 = 1' : 'Ellipse: x²/25 + y²/16 = 1'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 print-hide">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {lang === 'zh' ? '解析结果与几何坐标图' : t.steps.title}
                  </h2>
                </div>

                {/* View Mode Switcher: Combined / Graph First / Steps First */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setStageTab('both')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      stageTab === 'both'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'zh' ? '🌓 左右并排' : 'Side-by-Side'}
                  </button>
                  <button
                    onClick={() => setStageTab('graph')}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                      stageTab === 'graph'
                        ? 'bg-white text-sky-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{lang === 'zh' ? '📈 焦点准线坐标图' : 'Graph Visualization'}</span>
                  </button>
                  <button
                    onClick={() => setStageTab('steps')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      stageTab === 'steps'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'zh' ? '📝 配方解题全过程' : 'Detailed Steps'}
                  </button>
                </div>
              </div>

              {/* Conditional Layout based on stageTab */}
              {stageTab === 'both' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  {/* Left Zone: Step-by-Step Completing the Square Solution (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <StepsSolutionView
                      conic={currentResult}
                      lang={lang}
                      onViewGraph={() => setStageTab('graph')}
                      onBookmarkChanged={() => setHistoryList(getHistory())}
                      onOpenBookmarks={() => {
                        setHistoryDrawerTab('bookmarks');
                        setHistoryOpen(true);
                      }}
                    />
                  </div>

                  {/* Right Zone: Interactive Geometric Coordinate Canvas (5 cols) */}
                  <div className="lg:col-span-5 space-y-6 sticky top-20 print-hide">
                    <ParabolaCanvas conic={currentResult} lang={lang} />

                    {/* Quick Math Knowledge Flashcard */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm space-y-2.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                        <BookOpen className="w-4 h-4 text-sky-600" />
                        <span>
                          {currentResult.conicType === 'parabola' && (lang === 'zh' ? '抛物线第一定义' : 'Parabola Definition')}
                          {currentResult.conicType === 'ellipse' && (lang === 'zh' ? '椭圆第一定义' : 'Ellipse Definition')}
                          {currentResult.conicType === 'hyperbola' && (lang === 'zh' ? '双曲线第一定义' : 'Hyperbola Definition')}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {currentResult.conicType === 'parabola' && (lang === 'zh' ? '到定点 F（焦点）与定直线 l（准线）距离相等的轨迹。' : 'Locus of points equidistant from Focus and Directrix.')}
                        {currentResult.conicType === 'ellipse' && (lang === 'zh' ? '平面内到两定点 F₁, F₂ 的距离之和等于定长 2a（2a > |F₁F₂|）的轨迹。' : 'Locus of points where the sum of distances to two foci is constant 2a.')}
                        {currentResult.conicType === 'hyperbola' && (lang === 'zh' ? '平面内到两定点 F₁, F₂ 的距离之差的绝对值等于定长 2a（2a < |F₁F₂|）的轨迹。' : 'Locus of points where the absolute difference of distances to two foci is constant 2a.')}
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center font-bold text-base text-slate-800">
                        {currentResult.conicType === 'parabola' && <MathView math="|PF| = d(P, l)" />}
                        {currentResult.conicType === 'ellipse' && <MathView math="|PF_1| + |PF_2| = 2a" />}
                        {currentResult.conicType === 'hyperbola' && <MathView math="||PF_1| - |PF_2|| = 2a" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stageTab === 'graph' && (
                <div className="space-y-6">
                  <ParabolaCanvas conic={currentResult} lang={lang} />
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-sm text-slate-700 font-medium">
                      {lang === 'zh' ? '已展示焦点坐标、准线方程、通径弦与 p/2 距离标尺' : 'Displaying focus coordinates, directrix line, latus rectum and p/2 distance.'}
                    </span>
                    <button
                      onClick={() => setStageTab('steps')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      {lang === 'zh' ? '查看详细配方解题步骤 →' : 'View Step-by-Step Breakdown →'}
                    </button>
                  </div>
                </div>
              )}

              {stageTab === 'steps' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-xs sm:text-sm text-sky-900">
                    <span className="font-semibold">
                      {lang === 'zh' ? '💡 想看几何画板？点击即可随时切换到焦点与准线坐标图' : 'Want to view geometric coordinate graph? Click to switch anytime'}
                    </span>
                    <button
                      onClick={() => setStageTab('graph')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      {lang === 'zh' ? '查看坐标图' : 'View Graph'}
                    </button>
                  </div>
                  <StepsSolutionView
                    conic={currentResult}
                    lang={lang}
                    onViewGraph={() => setStageTab('graph')}
                    onBookmarkChanged={() => setHistoryList(getHistory())}
                    onOpenBookmarks={() => {
                      setHistoryDrawerTab('bookmarks');
                      setHistoryOpen(true);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* Section 3: Opening Direction Guide & Pitfalls */}
        <section id="guide-section" className="pt-2 print-hide">
          <OpeningDirectionGuide lang={lang} />
        </section>

        {/* Section 4: Self-Test Quiz */}
        <section id="quiz-section" className="pt-2 print-hide">
          <ParabolaQuiz lang={lang} />
        </section>

        {/* Section 5: High School Geometry Formula Cheat Sheet */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 print-hide">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {lang === 'zh'
                ? '圆锥曲线大题高频秒杀公式速查卡'
                : 'Conic Sections Essential Exam Formula Cheat Sheet'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '1. 焦点与准线统一定义（第二定义）' : '1. Unified Directrix Definition'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '曲线上任意动点到焦点与准线的距离比等于离心率：' : 'Ratio of distance to focus over distance to directrix equals eccentricity:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math="\frac{|PF|}{d(P, l)} = e" />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh' ? 'e < 1 为椭圆；e = 1 为抛物线；e > 1 为双曲线。' : 'e < 1: Ellipse; e = 1: Parabola; e > 1: Hyperbola.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '2. 通径长统一公式' : '2. Latus Rectum Unified Length'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '过焦点垂直于对称轴的弦长：' : 'Length of focal chord perpendicular to major/transverse axis:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math={`2p \\quad \\text{${lang === 'zh' ? '或' : lang === 'fr' ? 'ou' : lang === 'es' || lang === 'pt' ? 'o' : 'or'}} \\quad \\frac{2b^2}{a}`} />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh' ? '作图与求弦长最小值大题的第一核心量。' : 'Key parameter for sketching curve curvature.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '3. 离心率与渐近线关系' : '3. Asymptotes & Eccentricity'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '双曲线渐近线斜率与离心率的直接互化：' : 'Relation between asymptote slope and eccentricity in hyperbola:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math="e^2 = 1 + \left(\frac{b}{a}\right)^2 = 1 + k^2" />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh' ? '已知渐近线斜率 k 即可直接秒解离心率 e。' : 'Directly converts asymptote slope into eccentricity without solving a and b.'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: FAQ Accordion */}
        <section id="faq-section" className="pt-2 print-hide">
          <FaqSection lang={lang} />
        </section>

        {/* Section 7: Keyword Cloud / SEO Topics */}
        <section className="pt-2 print-hide">
          <KeywordTags lang={lang} onTagClick={handleTagClick} />
        </section>
      </main>

      {/* History & Bookmarks Drawer Modal */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        historyList={historyList}
        onSelectEquation={(eq) => {
          const res = parseUniversalConic(eq, lang);
          handleSolve(res, eq);
        }}
        onUpdateList={setHistoryList}
        lang={lang}
        initialTab={historyDrawerTab}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-14 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <div>
            <span>{t.footer.desc}</span>
          </div>
          <div>
            <span>{t.footer.rights}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
