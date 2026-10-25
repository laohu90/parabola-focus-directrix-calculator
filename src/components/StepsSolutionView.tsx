import React, { useState } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { formatFractionLaTeX } from '../utils/fraction.ts';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Printer,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  ListOrdered,
  Eye,
  Crosshair
} from 'lucide-react';

interface StepsSolutionViewProps {
  conic: ConicAnalysisResult;
  lang: Language;
  onViewGraph?: () => void;
}

export const StepsSolutionView: React.FC<StepsSolutionViewProps> = ({ conic, lang, onViewGraph }) => {
  const tSummary = translations[lang].summary;
  const tSteps = translations[lang].steps;

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'stepper'>('all');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });

  const toggleWhy = (idx: number) => {
    setExpandedWhy((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySummary = () => {
    let text = `【Conic Section Solution / 圆锥曲线求解报告】\n`;
    text += `Type: ${conic.conicType.toUpperCase()}\n`;
    text += `Standard Form: ${conic.standardLatex}\n`;
    text += `Center/Vertex: (${conic.centerOrVertex.x}, ${conic.centerOrVertex.y})\n`;
    text += `Foci: ${conic.foci.map((f) => `(${f.x}, ${f.y})`).join(', ')}\n`;
    text += `Eccentricity: ${conic.eccentricity.latex}\n`;
    text += `Latus Rectum: ${conic.latusRectum.latex}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
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
      {/* Printable Document Header (Only shown during printing) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === 'zh' ? '圆锥曲线解析几何解题报告' : 'Conic Sections Step-by-Step Analytic Solution Report'}
        </h1>
        <div className="text-sm text-slate-600 mt-1 flex justify-between">
          <span>{lang === 'zh' ? '曲线类型' : 'Conic Type'}: {conicTypeNames[conic.conicType]}</span>
          <span>{lang === 'zh' ? '标准方程' : 'Standard Form'}: {conic.standardLatex}</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
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

          <div className="flex items-center gap-2 print-hide">
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">{tSummary.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{tSummary.copyBtn}</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
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

        {/* Standard Form Banner */}
        <div className="mt-4 p-4 rounded-lg bg-sky-50/60 border border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-sky-900">{tSummary.standardEq}:</span>
            <MathView math={conic.standardLatex} className="text-base sm:text-lg font-bold" />
          </div>
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

        {/* MODE 1: ALL STEPS VIEW */}
        {viewMode === 'all' && (
          <div className="divide-y divide-slate-100">
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
        )}

        {/* MODE 2: STEPPER / GUIDED STEP-BY-STEP VIEW */}
        {viewMode === 'stepper' && (
          <div className="p-5 sm:p-6 space-y-5">
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
    </div>
  );
};
