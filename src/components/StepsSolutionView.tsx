import React, { useState } from 'react';
import { ParabolaAnalysisResult } from '../utils/parabolaSolver.ts';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import { Check, Copy, ChevronDown, ChevronUp, Sparkles, BookOpen, Printer } from 'lucide-react';

interface StepsSolutionViewProps {
  parabola: ParabolaAnalysisResult;
  lang: Language;
}

export const StepsSolutionView: React.FC<StepsSolutionViewProps> = ({ parabola, lang }) => {
  const tSummary = translations[lang].summary;
  const tSteps = translations[lang].steps;
  const tGuide = translations[lang].guide;

  const [copied, setCopied] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(true);

  const copySummary = () => {
    const text = `【Parabola Solution / 抛物线求解结果】
Standard Form: ${parabola.standardVertexLatex}
Direction: ${parabola.direction}
Vertex V: (${parabola.vertex.x}, ${parabola.vertex.y})
Focus F: (${parabola.focus.x}, ${parabola.focus.y})
Directrix: ${parabola.directrix.latex}
Axis of Symmetry: ${parabola.axisOfSymmetry.latex}
Parameter p: ${parabola.p}, p/2: ${parabola.halfP}
Latus Rectum: ${parabola.latusRectum}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const dirMap: Record<string, string> = {
    right: tGuide.right,
    left: tGuide.left,
    up: tGuide.up,
    down: tGuide.down
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {tSummary.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{tSummary.printBtn}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Focus F */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.focus}</div>
            <div className="font-bold text-purple-700 text-base sm:text-lg">
              <MathView
                math={`F\\left(${parabola.focus.xFrac.den === 1 ? parabola.focus.xFrac.num : `\\frac{${parabola.focus.xFrac.num}}{${parabola.focus.xFrac.den}}`},\\ ${parabola.focus.yFrac.den === 1 ? parabola.focus.yFrac.num : `\\frac{${parabola.focus.yFrac.num}}{${parabola.focus.yFrac.den}}`}\\right)`}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              ({parabola.focus.x.toFixed(2).replace(/\.00$/, '')}, {parabola.focus.y.toFixed(2).replace(/\.00$/, '')})
            </div>
          </div>

          {/* Directrix */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.directrix}</div>
            <div className="font-bold text-rose-700 text-base sm:text-lg">
              <MathView math={parabola.directrix.latex} />
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {parabola.directrix.type} = {parabola.directrix.val.toFixed(2).replace(/\.00$/, '')}
            </div>
          </div>

          {/* Opening Direction */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.direction}</div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              {dirMap[parabola.direction] || parabola.direction}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {tSummary.axisOfSym}: <MathView math={parabola.axisOfSymmetry.latex} />
            </div>
          </div>

          {/* Vertex V */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.vertex}</div>
            <div className="font-bold text-slate-900 text-base sm:text-lg">
              <MathView
                math={`V\\left(${parabola.vertex.xFrac.den === 1 ? parabola.vertex.xFrac.num : `\\frac{${parabola.vertex.xFrac.num}}{${parabola.vertex.xFrac.den}}`},\\ ${parabola.vertex.yFrac.den === 1 ? parabola.vertex.yFrac.num : `\\frac{${parabola.vertex.yFrac.num}}{${parabola.vertex.yFrac.den}}`}\\right)`}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              ({parabola.vertex.x.toFixed(2).replace(/\.00$/, '')}, {parabola.vertex.y.toFixed(2).replace(/\.00$/, '')})
            </div>
          </div>

          {/* Parameter p and p/2 */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.pParam} / {tSummary.halfPParam}</div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              <MathView
                math={`p = ${parabola.pFrac.den === 1 ? parabola.pFrac.num : `\\frac{${parabola.pFrac.num}}{${parabola.pFrac.den}}`},\\ \\frac{p}{2} = ${parabola.halfPFrac.den === 1 ? parabola.halfPFrac.num : `\\frac{${parabola.halfPFrac.num}}{${parabola.halfPFrac.den}}`}`}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              p = {parabola.p.toFixed(2).replace(/\.00$/, '')}
            </div>
          </div>

          {/* Latus Rectum Ends */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.latusRectum} & {tSummary.latusEndpoints}</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              <MathView math={`2p = ${parabola.latusRectum}`} />
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              <MathView math={`L_{1,2}: ${parabola.latusEndpoints.p1.latex}, ${parabola.latusEndpoints.p2.latex}`} />
            </div>
          </div>

          {/* Domain & Range */}
          <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-500 mb-1">{tSummary.domain} & {tSummary.range}</div>
            <div className="text-xs sm:text-sm text-slate-900 space-y-0.5">
              <div>{tSummary.domain}: <MathView math={`x \\in ${parabola.domainLatex}`} /></div>
              <div>{tSummary.range}: <MathView math={`y \\in ${parabola.rangeLatex}`} /></div>
            </div>
          </div>
        </div>

        {/* Standard Vertex Form Banner */}
        <div className="mt-4 p-4 rounded-lg bg-sky-50/60 border border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-sky-900">{tSummary.standardEq}:</span>
            <MathView math={parabola.standardVertexLatex} className="text-base sm:text-lg font-bold" />
          </div>
          <div className="text-xs text-sky-800">
            {tSummary.eccentricity}: <MathView math="e = 1" />
          </div>
        </div>
      </div>

      {/* Step-by-Step Completing the Square Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {tSteps.title}
              </h3>
              <p className="text-xs text-slate-500">
                {tSteps.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <span>{showAllSteps ? tSteps.collapseAll : tSteps.expandAll}</span>
            {showAllSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAllSteps && (
          <div className="divide-y divide-slate-100">
            {parabola.steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 transition-colors ${
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

                <div className="pl-8 sm:pl-8">
                  <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 my-2 shadow-2xs">
                    <MathView math={step.math} block className="text-base sm:text-lg" />
                  </div>
                  {step.note && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
