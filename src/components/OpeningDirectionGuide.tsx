import React, { useState } from 'react';
import { MathView } from './MathView.tsx';
import { Language, translations } from '../i18n/translations.ts';
import { Compass, AlertTriangle, Lightbulb, CheckCircle2, BookOpen } from 'lucide-react';

interface OpeningDirectionGuideProps {
  lang: Language;
}

export const OpeningDirectionGuide: React.FC<OpeningDirectionGuideProps> = ({ lang }) => {
  const t = translations[lang].guide;
  const [activeTab, setActiveTab] = useState<'standard' | 'mnemonics' | 'pitfalls'>('standard');

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'standard'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabTable}
          </button>
          <button
            onClick={() => setActiveTab('mnemonics')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'mnemonics'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabMnemonics}
          </button>
          <button
            onClick={() => setActiveTab('pitfalls')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pitfalls'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabPitfalls}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6">
        {activeTab === 'standard' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3.5 border-r border-slate-200">{t.tblEq}</th>
                    <th className="py-3 px-3.5 border-r border-slate-200">{t.tblDir}</th>
                    <th className="py-3 px-3.5 border-r border-slate-200">{t.tblFocus}</th>
                    <th className="py-3 px-3.5 border-r border-slate-200">{t.tblDirectrix}</th>
                    <th className="py-3 px-3.5">{t.tblAxis}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3.5 border-r border-slate-200 font-medium">
                      <MathView math="y^2 = 2px \ (p > 0)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-sky-700 font-semibold">
                      {t.right}
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200">
                      <MathView math="F\left(\frac{p}{2},\ 0\right)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-rose-600 font-medium">
                      <MathView math="x = -\frac{p}{2}" />
                    </td>
                    <td className="py-3 px-3.5">
                      <MathView math="y = 0 \ (x\text{-axis})" />
                    </td>
                  </tr>

                  <tr className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3.5 border-r border-slate-200 font-medium">
                      <MathView math="y^2 = -2px \ (p > 0)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-sky-700 font-semibold">
                      {t.left}
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200">
                      <MathView math="F\left(-\frac{p}{2},\ 0\right)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-rose-600 font-medium">
                      <MathView math="x = \frac{p}{2}" />
                    </td>
                    <td className="py-3 px-3.5">
                      <MathView math="y = 0 \ (x\text{-axis})" />
                    </td>
                  </tr>

                  <tr className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3.5 border-r border-slate-200 font-medium">
                      <MathView math="x^2 = 2py \ (p > 0)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-indigo-700 font-semibold">
                      {t.up}
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200">
                      <MathView math="F\left(0,\ \frac{p}{2}\right)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-rose-600 font-medium">
                      <MathView math="y = -\frac{p}{2}" />
                    </td>
                    <td className="py-3 px-3.5">
                      <MathView math="x = 0 \ (y\text{-axis})" />
                    </td>
                  </tr>

                  <tr className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3.5 border-r border-slate-200 font-medium">
                      <MathView math="x^2 = -2py \ (p > 0)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-indigo-700 font-semibold">
                      {t.down}
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200">
                      <MathView math="F\left(0,\ -\frac{p}{2}\right)" />
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-200 text-rose-600 font-medium">
                      <MathView math="y = \frac{p}{2}" />
                    </td>
                    <td className="py-3 px-3.5">
                      <MathView math="x = 0 \ (y\text{-axis})" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              {t.tblNote}
            </p>
          </div>
        )}

        {activeTab === 'mnemonics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{t.rule1Title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.rule1Text}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t.rule2Title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.rule2Text}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-sky-600 shrink-0" />
                <span>{t.rule3Title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.rule3Text}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pitfalls' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-rose-900 text-sm sm:text-base">
                    {t.pitfall1Title}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {t.pitfall1Text}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-amber-900 text-sm sm:text-base">
                    {t.pitfall2Title}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {t.pitfall2Text}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">
                    {t.pitfall3Title}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {t.pitfall3Text}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-indigo-900 text-sm sm:text-base">
                    {t.pitfall4Title}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {t.pitfall4Text}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
