import React, { useState, useEffect } from 'react';
import { solveParabolaGeneral, ParabolaAnalysisResult } from './utils/parabolaSolver.ts';
import { parseNaturalEquation } from './utils/equationParser.ts';
import { ParabolaInput } from './components/ParabolaInput.tsx';
import { StepsSolutionView } from './components/StepsSolutionView.tsx';
import { ParabolaCanvas } from './components/ParabolaCanvas.tsx';
import { OpeningDirectionGuide } from './components/OpeningDirectionGuide.tsx';
import { ParabolaQuiz } from './components/ParabolaQuiz.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { KeywordTags } from './components/KeywordTags.tsx';
import { MathView } from './components/MathView.tsx';
import { Language, translations } from './i18n/translations.ts';
import {
  Compass,
  BookOpen,
  Sparkles,
  GraduationCap,
  Globe
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
  const [currentResult, setCurrentResult] = useState<ParabolaAnalysisResult>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEq = params.get('eq');
      const urlLang = (params.get('lang') as Language) || 'en';
      if (urlEq) {
        try {
          return parseNaturalEquation(urlEq, urlLang);
        } catch {
          // fallback to default
        }
      }
    }
    return solveParabolaGeneral('horizontal', 1, -4, -8, 12, 'en');
  });

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

  // Re-run solver when language changes so that step explanation notes match active language
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      const A = currentResult.orientation === 'horizontal' ? 1 : 1;
      const B = currentResult.orientation === 'horizontal' ? -2 * currentResult.vertex.y : -2 * currentResult.vertex.x;
      const C = currentResult.orientation === 'horizontal'
        ? (currentResult.direction === 'right' ? -2 * currentResult.p : 2 * currentResult.p)
        : (currentResult.direction === 'up' ? -2 * currentResult.p : 2 * currentResult.p);
      const D = currentResult.orientation === 'horizontal'
        ? currentResult.vertex.y * currentResult.vertex.y + (currentResult.direction === 'right' ? 2 * currentResult.p : -2 * currentResult.p) * currentResult.vertex.x
        : currentResult.vertex.x * currentResult.vertex.x + (currentResult.direction === 'up' ? 2 * currentResult.p : -2 * currentResult.p) * currentResult.vertex.y;

      setCurrentResult(solveParabolaGeneral(currentResult.orientation, A, B, C, D, newLang));
    } catch {
      // Fallback
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSolve = (result: ParabolaAnalysisResult) => {
    setCurrentResult(result);
  };

  const handleTagClick = (tag: string) => {
    scrollToSection('solver-section');
    if (tag.includes('y² = 2px') || tag.includes('y^2')) {
      const res = parseNaturalEquation('y^2 = 8x', lang);
      setCurrentResult(res);
    } else if (tag.includes('x-h') || tag.includes('completar') || tag.includes('complétion') || tag.includes('配方')) {
      const res = parseNaturalEquation('y^2 - 4y - 8x + 12 = 0', lang);
      setCurrentResult(res);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar adhering to Frontend Design Constitution */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {t.nav.brand}
            </span>
          </div>

          {/* Zone 2: 4-5 single-line navigation links */}
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

          {/* Zone 3: Language Selector & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
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
        <section className="text-center max-w-3xl mx-auto pt-2 pb-2">
          {/* Unboxed Metadata Disciplined Line */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 mb-3">
            <span>{t.meta.badge1}</span>
            <span aria-hidden="true">·</span>
            <span>{t.meta.badge2}</span>
            <span aria-hidden="true">·</span>
            <span>{t.meta.badge3}</span>
            <span aria-hidden="true">·</span>
            <span>{t.meta.badge4}</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4"
            style={{ textWrap: 'balance' }}
          >
            {t.hero.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
        </section>

        {/* Section 1: Input & Presets */}
        <section id="solver-section">
          <ParabolaInput onSolve={handleSolve} currentResult={currentResult} lang={lang} />
        </section>

        {/* Section 2: Two-Zone Interactive Stage (Solution Steps on Left, Dynamic Canvas on Right) */}
        <section id="canvas-section" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.steps.title}
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-mono">
              {t.summary.axisOfSym}: <MathView math={currentResult.axisOfSymmetry.latex} /> · {t.summary.direction}: {currentResult.direction}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Zone: Step-by-Step Completing the Square Solution (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <StepsSolutionView parabola={currentResult} lang={lang} />
            </div>

            {/* Right Zone: Interactive Geometric Coordinate Canvas (5 cols) */}
            <div className="lg:col-span-5 space-y-6 sticky top-20">
              <ParabolaCanvas parabola={currentResult} lang={lang} />

              {/* Quick Math Knowledge Flashcard */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm space-y-2.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>{lang === 'zh' ? '抛物线第一几何定义' : 'Geometric Definition of Parabola'}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {lang === 'zh'
                    ? '平面内与一个定点 F（焦点）和一条定直线 l（准线，且定点不在定直线上）距离相等的点的轨迹叫做抛物线。'
                    : 'A parabola is the locus of a point P equidistant from a fixed point (Focus F) and a fixed line (Directrix l).'}
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center font-bold text-base text-slate-800">
                  <MathView math="|PF| = d(P, l)" />
                </div>
                <p className="text-slate-500 text-xs">
                  {lang === 'zh'
                    ? '顶点到焦点与准线的距离各为 p/2，焦点到准线的距离为 p。'
                    : 'Vertex is midway between Focus and Directrix, each distance equal to p/2.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Opening Direction Guide & Pitfalls */}
        <section id="guide-section" className="pt-2">
          <OpeningDirectionGuide lang={lang} />
        </section>

        {/* Section 4: Self-Test Quiz */}
        <section id="quiz-section" className="pt-2">
          <ParabolaQuiz lang={lang} />
        </section>

        {/* Section 5: High School Geometry Formula Cheat Sheet */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {lang === 'zh'
                ? '高二解析几何 · 抛物线高频秒杀公式速查卡'
                : 'Conic Sections · Parabola Essential Exam Formulas'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '1. 焦半径公式（以 y²=2px 为例）' : '1. Focal Radius Formula (for y²=2px)'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '设抛物线上动点 P(x₀, y₀)，到焦点的距离为：' : 'Distance from point P(x₀, y₀) to Focus:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math="|PF| = x_0 + \frac{p}{2}" />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh'
                  ? '省去求根号的繁琐计算，直接用横坐标加上半距 p/2。'
                  : 'Derived directly from distance to directrix: d = x₀ - (-p/2) = x₀ + p/2.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '2. 焦点弦长公式' : '2. Focal Chord Length Formula'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '过焦点弦两端点 A(x₁, y₁), B(x₂, y₂)：' : 'Focal chord AB with inclination angle θ:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math="|AB| = x_1 + x_2 + p = \frac{2p}{\sin^2\theta}" />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh'
                  ? '当 θ = 90° 时弦垂直于对称轴，即为通径长 2p。'
                  : 'When θ = 90°, the chord is the latus rectum of length 2p.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-bold text-slate-900">
                {lang === 'zh' ? '3. 焦点弦倒数和性质' : '3. Reciprocal Focal Segment Property'}
              </div>
              <div className="text-slate-600">
                {lang === 'zh' ? '焦点分弦所得两线段的倒数和恒为常数：' : 'Segments AF and BF formed by focus division:'}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-center font-bold text-base">
                <MathView math="\frac{1}{|AF|} + \frac{1}{|BF|} = \frac{2}{p}" />
              </div>
              <p className="text-slate-500 text-xs">
                {lang === 'zh'
                  ? '无论焦点弦斜率如何改变，倒数之和始终恒等于 2/p。'
                  : 'Invariant under any chord orientation; frequently tested in exams.'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: FAQ Accordion */}
        <section id="faq-section" className="pt-2">
          <FaqSection lang={lang} />
        </section>

        {/* Section 7: Keyword Cloud / SEO Topics */}
        <section className="pt-2">
          <KeywordTags lang={lang} onTagClick={handleTagClick} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-14">
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
