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
  History
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

  // Default problem or from URL ?eq=...
  const [currentResult, setCurrentResult] = useState<ConicAnalysisResult>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEq = params.get('eq');
      const urlLang = (params.get('lang') as Language) || 'en';
      if (urlEq) {
        try {
          return parseUniversalConic(urlEq, urlLang);
        } catch {
          // fallback
        }
      }
    }
    return solveParabola('horizontal', 1, -4, -8, 12, 'en');
  });

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => getHistory());

  // View mode tab for Section 2: 'both' (side-by-side), 'graph' (graph visualization first), 'steps' (detailed steps first)
  const [stageTab, setStageTab] = useState<'both' | 'graph' | 'steps'>('both');

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

  // Re-run solver when language changes
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (currentResult.rawEquation) {
      try {
        const re = parseUniversalConic(currentResult.rawEquation, newLang);
        setCurrentResult(re);
      } catch {
        // fallback
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
    const finalResult = { ...result, rawEquation: eqText || result.standardLatex };
    setCurrentResult(finalResult);

    // Save to history
    if (eqText) {
      const updated = saveHistoryItem(eqText, result.conicType);
      setHistoryList(updated);
    }

    // Sync to URL
    if (typeof window !== 'undefined' && eqText) {
      const url = new URL(window.location.href);
      url.searchParams.set('eq', eqText);
      window.history.replaceState({}, '', url.toString());
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
      {/* 3-Zone Top Navigation Bar adhering to Frontend Design Constitution */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {lang === 'zh' ? '圆锥曲线与抛物线焦点求解器' : 'Conic Sections & Parabola Solver'}
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-semibold text-slate-600">
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

          {/* Zone 3: Language Selector & History */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* History Toggle Button */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
              title="History"
            >
              <History className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">{lang === 'zh' ? '历史记录' : 'History'}</span>
              {historyList.length > 0 && (
                <span className="bg-sky-600 text-white rounded-full px-1.5 text-[10px] font-bold">
                  {historyList.length}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 shrink-0" />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer pr-1"
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
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.nav.startBtn}</span>
            </button>
          </div>
        </div>
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
            currentResult={currentResult}
            lang={lang}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        </section>

        {/* Section 2: Two-Zone Interactive Stage */}
        <section id="canvas-section" className="space-y-4">
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
              <StepsSolutionView conic={currentResult} lang={lang} onViewGraph={() => setStageTab('graph')} />
            </div>
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
                <MathView math="2p \quad \text{或} \quad \frac{2b^2}{a}" />
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

      {/* History Drawer Modal */}
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
