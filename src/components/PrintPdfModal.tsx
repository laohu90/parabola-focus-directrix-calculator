import React, { useState } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { formatFractionLaTeX } from '../utils/fraction.ts';
import { MathView } from './MathView.tsx';
import { Language } from '../i18n/translations.ts';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles
} from 'lucide-react';

interface PrintPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  conic: ConicAnalysisResult;
  lang: Language;
}

export const PrintPdfModal: React.FC<PrintPdfModalProps> = ({
  isOpen,
  onClose,
  conic,
  lang
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const conicTypeNames: Record<string, string> = {
    parabola: lang === 'zh' ? '抛物线' : 'Parabola',
    ellipse: lang === 'zh' ? '椭圆' : 'Ellipse',
    hyperbola: lang === 'zh' ? '双曲线' : 'Hyperbola'
  };

  const handleBrowserPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked in current frame:', e);
    }
  };

  const generateOfflineHtml = () => {
    const title = lang === 'zh' ? '圆锥曲线解析几何导学案' : 'Conic Section Analytic Geometry Study Sheet';
    const typeLabel = conicTypeNames[conic.conicType];

    let stepsHtml = '';
    conic.steps.forEach((step, idx) => {
      stepsHtml += `
        <div style="margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 6px;">
            第 ${idx + 1} 步：${step.title}
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 15px; margin: 8px 0;">
            ${step.math}
          </div>
          ${step.note ? `<div style="font-size: 12px; color: #334155; margin-top: 4px;">• 步骤说明：${step.note}</div>` : ''}
          ${step.whyExplanation ? `<div style="font-size: 12px; color: #78350f; background: #fffbeb; border: 1px solid #fde68a; padding: 8px 10px; border-radius: 4px; margin-top: 6px;">💡 原理剖析：${step.whyExplanation}</div>` : ''}
        </div>
      `;
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${conic.standardLatex}</title>
  <style>
    @page { size: A4; margin: 15mm 20mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; margin: 0 0 6px 0; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    .meta-bar { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin: 12px 0 20px 0; }
    .param-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .param-card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .param-label { font-weight: bold; color: #475569; font-size: 11px; text-transform: uppercase; }
    .param-value { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #e0f2fe; border: 1px solid #7dd3fc; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>📄 离线打印提示：</strong>可在浏览器菜单点击【打印】或按 <code>Ctrl+P</code>（Mac 按 <code>Cmd+P</code>）另存为高精度 PDF。</div>
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">立即打印 (Ctrl+P)</button>
  </div>

  <h1>${title}</h1>
  <div class="meta-bar">
    <div><strong>曲线类型：</strong>${typeLabel} (${conic.conicType.toUpperCase()})</div>
    <div><strong>标准方程：</strong>${conic.standardLatex}</div>
    <div><strong>生成日期：</strong>${new Date().toLocaleDateString()}</div>
  </div>

  <div class="param-grid">
    <div class="param-card">
      <div class="param-label">${conic.conicType === 'parabola' ? '顶点坐标 V' : '中心坐标 O'}</div>
      <div class="param-value">(${conic.centerOrVertex.x.toFixed(2).replace(/\.00$/, '')}, ${conic.centerOrVertex.y.toFixed(2).replace(/\.00$/, '')})</div>
    </div>
    <div class="param-card">
      <div class="param-label">焦点坐标 F</div>
      <div class="param-value">${conic.foci.map((f) => `${f.label}(${f.x}, ${f.y})`).join(', ')}</div>
    </div>
    <div class="param-card">
      <div class="param-label">离心率 e</div>
      <div class="param-value">${conic.eccentricity.latex} (${conic.conicType === 'parabola' ? 'e = 1' : conic.conicType === 'ellipse' ? '0 < e < 1' : 'e > 1'})</div>
    </div>
    <div class="param-card">
      <div class="param-label">通径长 2p / 2b²/a</div>
      <div class="param-value">${conic.latusRectum.latex} ≈ ${conic.latusRectum.val.toFixed(2).replace(/\.00$/, '')}</div>
    </div>
    ${conic.directrices.length > 0 ? `
    <div class="param-card" style="grid-column: span 2;">
      <div class="param-label">准线方程 Directrix</div>
      <div class="param-value" style="color: #be123c;">${conic.directrices.map((d) => d.latex).join('; ')}</div>
    </div>` : ''}
  </div>

  <h2 style="font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 24px 0 16px 0;">
    【配方法详细推导演算过程】
  </h2>

  ${stepsHtml}

  <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 11px; color: #64748b; text-align: center;">
    本文档由《圆锥曲线全能求解器》自动生成 · https://parabola-focus-directrix-calculator.formulacalckit.com
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conic-solution-${conic.conicType}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyTextOnly = () => {
    let t = `【${lang === 'zh' ? '圆锥曲线解析几何解题与配方报告' : 'Conic Section Analytic Geometry & Solution Report'}】\n`;
    t += `标准方程: ${conic.standardLatex}\n`;
    t += `顶点/中心: (${conic.centerOrVertex.x}, ${conic.centerOrVertex.y})\n`;
    t += `焦点坐标: ${conic.foci.map((f) => `${f.label}(${f.x}, ${f.y})`).join(', ')}\n`;
    if (conic.directrices.length > 0) {
      t += `准线方程: ${conic.directrices.map((d) => d.latex).join('; ')}\n`;
    }
    t += `离心率: ${conic.eccentricity.latex}\n`;
    t += `通径: ${conic.latusRectum.latex}\n\n`;
    t += `【推导过程】\n`;
    conic.steps.forEach((s, i) => {
      t += `${i + 1}. ${s.title}: ${s.math}\n`;
      if (s.whyExplanation) t += `   [原理]: ${s.whyExplanation}\n`;
    });

    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(t);
      } else {
        const ta = document.createElement('textarea');
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Printer className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {lang === 'zh' ? '打印与 PDF 导学案导出' : 'Print & Export PDF Study Sheet'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'zh'
                  ? '支持浏览器直接打印，或一键下载离线可打印 HTML 试卷'
                  : 'Print directly or download self-contained offline HTML study sheet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-2xs transition-colors"
              title="System Print"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'zh' ? '系统打印' : 'System Print'}</span>
            </button>

            <button
              onClick={generateOfflineHtml}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors shadow-2xs ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
              title="Download Offline HTML"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{lang === 'zh' ? '已成功下载！' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>{lang === 'zh' ? '下载离线 HTML' : 'Download HTML'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Environmental Sandbox Hint */}
        <div className="bg-sky-50/80 border-b border-sky-100 px-6 py-2.5 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              {lang === 'zh'
                ? '提示：若在嵌入测试环境或无打印机驱动时，点击【下载离线 HTML】可在任何浏览器中随时按 Ctrl+P 导出高精度矢量 PDF 试卷。'
                : 'Note: If inside an iframe or test environment, click "Download HTML" to open and save as high-res vector PDF in any browser.'}
            </span>
          </div>
          <button
            onClick={handleCopyTextOnly}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 shrink-0 ml-3 underline"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedText ? (lang === 'zh' ? '已复制文本！' : 'Copied!') : (lang === 'zh' ? '复制纯文本' : 'Copy Text')}</span>
          </button>
        </div>

        {/* Scrollable A4 Document Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center">
          <div className="w-full max-w-2xl bg-white p-6 sm:p-10 shadow-lg border border-slate-200 rounded-xl space-y-6">
            {/* Sheet Title */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {lang === 'zh' ? '圆锥曲线解析几何导学案与配方解题报告' : 'Conic Section Analytic Geometry Study Sheet'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    https://parabola-focus-directrix-calculator.formulacalckit.com
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <div className="font-bold text-slate-900">{new Date().toLocaleDateString()}</div>
                  <div className="uppercase font-semibold text-sky-700">{conicTypeNames[conic.conicType]}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <strong className="text-slate-800">{lang === 'zh' ? '输入方程' : 'Input'}:</strong>{' '}
                  <span className="font-mono text-slate-700">{conic.rawEquation || conic.standardLatex}</span>
                </div>
                <div>
                  <strong className="text-slate-800">{lang === 'zh' ? '标准方程' : 'Standard'}:</strong>{' '}
                  <span className="font-mono text-slate-900 font-bold">{conic.standardLatex}</span>
                </div>
              </div>
            </div>

            {/* Geometric Parameters Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">
                  {conic.conicType === 'parabola' ? (lang === 'zh' ? '顶点 V' : 'Vertex V') : (lang === 'zh' ? '中心 O' : 'Center O')}
                </div>
                <div className="font-bold text-sm sm:text-base text-slate-900">
                  <MathView
                    math={`${conic.centerOrVertex.label}\\left(${formatFractionLaTeX(conic.centerOrVertex.xFrac)}, ${formatFractionLaTeX(conic.centerOrVertex.yFrac)}\\right)`}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">{lang === 'zh' ? '焦点 F' : 'Foci F'}</div>
                <div className="font-bold text-xs sm:text-sm text-purple-700">
                  {conic.foci.map((f, i) => (
                    <div key={i}>
                      <MathView math={`${f.label}\\left(${formatFractionLaTeX(f.xFrac)}, ${formatFractionLaTeX(f.yFrac)}\\right)`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">{lang === 'zh' ? '离心率 e' : 'Eccentricity e'}</div>
                <div className="font-bold text-sm sm:text-base text-slate-900">
                  <MathView math={conic.eccentricity.latex} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">{lang === 'zh' ? '通径 2p' : 'Latus Rectum'}</div>
                <div className="font-bold text-sm sm:text-base text-amber-700">
                  <MathView math={conic.latusRectum.latex} />
                </div>
              </div>
            </div>

            {conic.directrices.length > 0 && (
              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-xs">
                <span className="font-bold text-rose-900 mr-2">{lang === 'zh' ? '准线方程' : 'Directrix'}:</span>
                <span className="font-bold text-rose-700">
                  {conic.directrices.map((d, i) => (
                    <span key={i} className="mr-3">
                      <MathView math={d.latex} />
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Step-by-Step Derivation */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                {lang === 'zh' ? '【配方法详细推导演算过程】' : '【Step-by-Step Completing the Square Breakdown】'}
              </h3>

              <div className="divide-y divide-slate-100">
                {conic.steps.map((step, idx) => (
                  <div key={idx} className="py-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{step.title}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg my-1.5">
                      <MathView math={step.math} block className="text-base" />
                    </div>

                    {step.note && (
                      <p className="text-xs text-slate-600 pl-7">{step.note}</p>
                    )}

                    {step.whyExplanation && (
                      <div className="ml-7 rounded bg-amber-50 border border-amber-200 p-2 text-xs text-amber-950">
                        <strong>{lang === 'zh' ? '💡 原理：' : 'Rationale: '}</strong>
                        {step.whyExplanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
              {lang === 'zh'
                ? '圆锥曲线全能求解器 · 自动排版 A4 导学案'
                : 'Conic Sections Solver · A4 Printable Study Sheet'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
