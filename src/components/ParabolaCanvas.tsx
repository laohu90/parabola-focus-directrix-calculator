import React, { useState, useMemo, useRef } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { Language, translations } from '../i18n/translations.ts';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

interface ParabolaCanvasProps {
  conic: ConicAnalysisResult;
  lang: Language;
}

export const ParabolaCanvas: React.FC<ParabolaCanvasProps> = ({ conic, lang }) => {
  const t = translations[lang].canvas;

  const [zoom, setZoom] = useState(1);
  const [showProofPoint, setShowProofPoint] = useState(true);
  const [showLatusRectum, setShowLatusRectum] = useState(true);
  const [curveParam, setCurveParam] = useState(2); // angle or parameter
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;

  // Determine scale
  const maxExtent = useMemo(() => {
    const coords = [
      Math.abs(conic.centerOrVertex.x),
      Math.abs(conic.centerOrVertex.y),
      ...conic.foci.map((f) => Math.max(Math.abs(f.x), Math.abs(f.y))),
      ...conic.vertices.map((v) => Math.max(Math.abs(v.x), Math.abs(v.y))),
      ...conic.directrices.map((d) => Math.abs(d.val))
    ];
    if (conic.parameters.a) coords.push(conic.parameters.a * 1.5);
    if (conic.parameters.b) coords.push(conic.parameters.b * 1.5);
    if (conic.parameters.p) coords.push(conic.parameters.p * 2);

    const maxVal = Math.max(...coords, 5);
    return Math.min(Math.max(maxVal * 1.5, 6), 35);
  }, [conic]);

  const baseScale = (Math.min(width, height) / (2 * maxExtent)) * zoom;
  const scale = Math.max(10, Math.min(baseScale, 110));

  const centerOffsetX = -conic.centerOrVertex.x * scale * 0.4;
  const centerOffsetY = conic.centerOrVertex.y * scale * 0.4;

  const toScreenX = (x: number) => cx + centerOffsetX + x * scale;
  const toScreenY = (y: number) => cy + centerOffsetY - y * scale;

  const fromScreenX = (sx: number) => (sx - (cx + centerOffsetX)) / scale;
  const fromScreenY = (sy: number) => -(sy - (cy + centerOffsetY)) / scale;

  // Paths for Parabola, Ellipse, or Hyperbola
  const curvePaths = useMemo(() => {
    if (conic.conicType === 'parabola') {
      const points: [number, number][] = [];
      const step = 0.15;
      const orientation = conic.parameters.orientation || 'horizontal';
      const direction = conic.parameters.direction || 'right';
      const p = conic.parameters.p || 2;
      const twoP = 2 * p;
      const tMax = Math.max(maxExtent * 1.8, 8);

      if (orientation === 'horizontal') {
        const dirSign = direction === 'right' ? 1 : -1;
        for (let tVal = -tMax; tVal <= tMax; tVal += step) {
          const y = conic.centerOrVertex.y + tVal;
          const x = conic.centerOrVertex.x + dirSign * ((tVal * tVal) / twoP);
          points.push([toScreenX(x), toScreenY(y)]);
        }
      } else {
        const dirSign = direction === 'up' ? 1 : -1;
        for (let tVal = -tMax; tVal <= tMax; tVal += step) {
          const x = conic.centerOrVertex.x + tVal;
          const y = conic.centerOrVertex.y + dirSign * ((tVal * tVal) / twoP);
          points.push([toScreenX(x), toScreenY(y)]);
        }
      }
      return ['M ' + points.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L ')];
    }

    if (conic.conicType === 'ellipse') {
      const a = conic.parameters.a || 4;
      const b = conic.parameters.b || 3;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const rx = isHoriz ? a : b;
      const ry = isHoriz ? b : a;
      const points: [number, number][] = [];
      const stepsCount = 100;
      for (let i = 0; i <= stepsCount; i++) {
        const theta = (i / stepsCount) * 2 * Math.PI;
        const x = conic.centerOrVertex.x + rx * Math.cos(theta);
        const y = conic.centerOrVertex.y + ry * Math.sin(theta);
        points.push([toScreenX(x), toScreenY(y)]);
      }
      return ['M ' + points.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L ') + ' Z'];
    }

    if (conic.conicType === 'hyperbola') {
      const a = conic.parameters.a || 4;
      const b = conic.parameters.b || 3;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const rightBranch: [number, number][] = [];
      const leftBranch: [number, number][] = [];
      const tMax = 2.2;
      const step = 0.08;

      for (let tVal = -tMax; tVal <= tMax; tVal += step) {
        const cosh = Math.cosh(tVal);
        const sinh = Math.sinh(tVal);
        if (isHoriz) {
          const xR = conic.centerOrVertex.x + a * cosh;
          const yR = conic.centerOrVertex.y + b * sinh;
          rightBranch.push([toScreenX(xR), toScreenY(yR)]);

          const xL = conic.centerOrVertex.x - a * cosh;
          const yL = conic.centerOrVertex.y + b * sinh;
          leftBranch.push([toScreenX(xL), toScreenY(yL)]);
        } else {
          const yR = conic.centerOrVertex.y + a * cosh;
          const xR = conic.centerOrVertex.x + b * sinh;
          rightBranch.push([toScreenX(xR), toScreenY(yR)]);

          const yL = conic.centerOrVertex.y - a * cosh;
          const xL = conic.centerOrVertex.x + b * sinh;
          leftBranch.push([toScreenX(xL), toScreenY(yL)]);
        }
      }

      return [
        'M ' + rightBranch.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L '),
        'M ' + leftBranch.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L ')
      ];
    }

    return [];
  }, [conic, scale, centerOffsetX, centerOffsetY, maxExtent]);

  // Point P for Geometric Definition Demonstration
  const pointPData = useMemo(() => {
    let px = 0, py = 0;
    const { centerOrVertex, conicType } = conic;

    if (conicType === 'parabola') {
      const orientation = conic.parameters.orientation || 'horizontal';
      const direction = conic.parameters.direction || 'right';
      const p = conic.parameters.p || 2;
      const twoP = 2 * p;
      const tVal = curveParam;

      if (orientation === 'horizontal') {
        const dirSign = direction === 'right' ? 1 : -1;
        py = centerOrVertex.y + tVal;
        px = centerOrVertex.x + dirSign * ((tVal * tVal) / twoP);
      } else {
        const dirSign = direction === 'up' ? 1 : -1;
        px = centerOrVertex.x + tVal;
        py = centerOrVertex.y + dirSign * ((tVal * tVal) / twoP);
      }

      const focus = conic.foci[0] || { x: 0, y: 0 };
      const distF = Math.sqrt((px - focus.x) ** 2 + (py - focus.y) ** 2);
      const directrix = conic.directrices[0] || { type: 'x', val: 0 };
      const distD = Math.abs(directrix.type === 'x' ? px - directrix.val : py - directrix.val);
      const footX = directrix.type === 'x' ? directrix.val : px;
      const footY = directrix.type === 'y' ? directrix.val : py;

      return { px, py, footX, footY, dist1: distF, dist2: distD, label: '|PF| = d(P, 准线)' };
    }

    if (conicType === 'ellipse') {
      const a = conic.parameters.a || 4;
      const b = conic.parameters.b || 3;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const theta = (curveParam / 6) * Math.PI; // map -6..6 to -pi..pi
      px = centerOrVertex.x + (isHoriz ? a : b) * Math.cos(theta);
      py = centerOrVertex.y + (isHoriz ? b : a) * Math.sin(theta);

      const f1 = conic.foci[0] || { x: 0, y: 0 };
      const f2 = conic.foci[1] || { x: 0, y: 0 };
      const dist1 = Math.sqrt((px - f1.x) ** 2 + (py - f1.y) ** 2);
      const dist2 = Math.sqrt((px - f2.x) ** 2 + (py - f2.y) ** 2);
      return { px, py, f1, f2, dist1, dist2, sum: dist1 + dist2, label: '|PF₁| + |PF₂| = 2a' };
    }

    if (conicType === 'hyperbola') {
      const a = conic.parameters.a || 4;
      const b = conic.parameters.b || 3;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const tVal = curveParam * 0.3;
      const cosh = Math.cosh(tVal);
      const sinh = Math.sinh(tVal);
      px = centerOrVertex.x + (isHoriz ? a * cosh : b * sinh);
      py = centerOrVertex.y + (isHoriz ? b * sinh : a * cosh);

      const f1 = conic.foci[0] || { x: 0, y: 0 };
      const f2 = conic.foci[1] || { x: 0, y: 0 };
      const dist1 = Math.sqrt((px - f1.x) ** 2 + (py - f1.y) ** 2);
      const dist2 = Math.sqrt((px - f2.x) ** 2 + (py - f2.y) ** 2);
      return { px, py, f1, f2, dist1, dist2, diff: Math.abs(dist1 - dist2), label: '||PF₁| - |PF₂|| = 2a' };
    }

    return null;
  }, [conic, curveParam]);

  // Coordinate grid ticks
  const gridTicks = useMemo(() => {
    let tickStep = 1;
    if (scale < 20) tickStep = 5;
    else if (scale < 35) tickStep = 2;
    else if (scale > 70) tickStep = 0.5;

    const minX = Math.floor(fromScreenX(0) / tickStep) * tickStep;
    const maxX = Math.ceil(fromScreenX(width) / tickStep) * tickStep;
    const minY = Math.floor(fromScreenY(height) / tickStep) * tickStep;
    const maxY = Math.ceil(fromScreenY(0) / tickStep) * tickStep;

    const xTicks = [];
    for (let x = minX; x <= maxX; x += tickStep) {
      if (Math.abs(x) < 1e-6) continue;
      xTicks.push(x);
    }
    const yTicks = [];
    for (let y = minY; y <= maxY; y += tickStep) {
      if (Math.abs(y) < 1e-6) continue;
      yTicks.push(y);
    }
    return { xTicks, yTicks };
  }, [scale, centerOffsetX, centerOffsetY, width, height]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* Canvas Top Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 print-hide">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-sky-600" />
          <span className="text-sm sm:text-base font-bold text-slate-900">
            {t.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.25, 3))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z * 0.8, 0.4))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.resetView}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowProofPoint(!showProofPoint)}
            className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showProofPoint ? 'bg-sky-50 text-sky-700 border-sky-200 font-semibold' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {t.toggleProof} {showProofPoint ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[420px] sm:h-[460px] bg-white select-none overflow-hidden" ref={containerRef}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ cursor: 'crosshair' }}>
          {/* Grid lines */}
          <g className="grid-layer">
            {gridTicks.xTicks.map((x) => (
              <line key={`gx-${x}`} x1={toScreenX(x)} y1={0} x2={toScreenX(x)} y2={height} stroke="#F1F5F9" strokeWidth="1" />
            ))}
            {gridTicks.yTicks.map((y) => (
              <line key={`gy-${y}`} x1={0} y1={toScreenY(y)} x2={width} y2={toScreenY(y)} stroke="#F1F5F9" strokeWidth="1" />
            ))}
          </g>

          {/* Axes of Symmetry */}
          {conic.axesOfSymmetry.map((axis, idx) => (
            <line
              key={idx}
              x1={axis.type === 'x' ? toScreenX(axis.val) : 0}
              y1={axis.type === 'x' ? 0 : toScreenY(axis.val)}
              x2={axis.type === 'x' ? toScreenX(axis.val) : width}
              y2={axis.type === 'x' ? height : toScreenY(axis.val)}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
          ))}

          {/* Cartesian Axes */}
          <line x1={0} y1={toScreenY(0)} x2={width} y2={toScreenY(0)} stroke="#64748B" strokeWidth="1.5" />
          <line x1={toScreenX(0)} y1={height} x2={toScreenX(0)} y2={0} stroke="#64748B" strokeWidth="1.5" />
          <text x={width - 16} y={toScreenY(0) + 16} fontSize="13" fontWeight="bold" fill="#475569">x</text>
          <text x={toScreenX(0) + 10} y={16} fontSize="13" fontWeight="bold" fill="#475569">y</text>

          {/* Directrices */}
          {conic.directrices.map((d, idx) => (
            <g key={`d-${idx}`}>
              <line
                x1={d.type === 'x' ? toScreenX(d.val) : 0}
                y1={d.type === 'x' ? 0 : toScreenY(d.val)}
                x2={d.type === 'x' ? toScreenX(d.val) : width}
                y2={d.type === 'x' ? height : toScreenY(d.val)}
                stroke="#E11D48"
                strokeWidth="1.8"
                strokeDasharray="6,4"
              />
            </g>
          ))}

          {/* Conic Curve(s) */}
          {curvePaths.map((pathStr, idx) => (
            <path key={idx} d={pathStr} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          ))}

          {/* Center or Vertex */}
          <g>
            <circle cx={toScreenX(conic.centerOrVertex.x)} cy={toScreenY(conic.centerOrVertex.y)} r="5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x={toScreenX(conic.centerOrVertex.x) - 10} y={toScreenY(conic.centerOrVertex.y) + 16} fontSize="12" fontWeight="bold" fill="#1E293B">
              {conic.centerOrVertex.label}({conic.centerOrVertex.x.toFixed(1).replace(/\.0$/, '')}, {conic.centerOrVertex.y.toFixed(1).replace(/\.0$/, '')})
            </text>
          </g>

          {/* Foci */}
          {conic.foci.map((f, idx) => (
            <g key={`f-${idx}`}>
              <circle cx={toScreenX(f.x)} cy={toScreenY(f.y)} r="5.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={toScreenX(f.x) + 8} y={toScreenY(f.y) - 8} fontSize="11" fontWeight="bold" fill="#6D28D9">
                {f.label}({f.x.toFixed(1).replace(/\.0$/, '')}, {f.y.toFixed(1).replace(/\.0$/, '')})
              </text>
            </g>
          ))}

          {/* Interactive Point P on Curve */}
          {showProofPoint && pointPData && (
            <g>
              {conic.conicType === 'parabola' && (
                <>
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(conic.foci[0]?.x || 0)} y2={toScreenY(conic.foci[0]?.y || 0)} stroke="#10B981" strokeWidth="2" />
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(pointPData.footX || 0)} y2={toScreenY(pointPData.footY || 0)} stroke="#10B981" strokeWidth="2" />
                </>
              )}
              {conic.conicType === 'ellipse' && pointPData.f1 && pointPData.f2 && (
                <>
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(pointPData.f1.x)} y2={toScreenY(pointPData.f1.y)} stroke="#10B981" strokeWidth="2" />
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(pointPData.f2.x)} y2={toScreenY(pointPData.f2.y)} stroke="#10B981" strokeWidth="2" />
                </>
              )}
              {conic.conicType === 'hyperbola' && pointPData.f1 && pointPData.f2 && (
                <>
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(pointPData.f1.x)} y2={toScreenY(pointPData.f1.y)} stroke="#10B981" strokeWidth="2" />
                  <line x1={toScreenX(pointPData.px)} y1={toScreenY(pointPData.py)} x2={toScreenX(pointPData.f2.x)} y2={toScreenY(pointPData.f2.y)} stroke="#10B981" strokeWidth="2" />
                </>
              )}

              <circle cx={toScreenX(pointPData.px)} cy={toScreenY(pointPData.py)} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <text x={toScreenX(pointPData.px) + 8} y={toScreenY(pointPData.py) - 8} fontSize="12" fill="#047857" fontWeight="bold">
                P({pointPData.px.toFixed(2)}, {pointPData.py.toFixed(2)})
              </text>
            </g>
          )}
        </svg>

        {/* Floating Definition Verification Badge */}
        {showProofPoint && pointPData && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-emerald-200 rounded-lg p-3 shadow-xs text-xs sm:text-sm">
            <div className="font-bold text-emerald-800 mb-1">
              {conic.conicType === 'parabola' && `抛物线第一定义验证：${pointPData.label}`}
              {conic.conicType === 'ellipse' && `椭圆第一定义验证：|PF₁| + |PF₂| = 2a`}
              {conic.conicType === 'hyperbola' && `双曲线第一定义验证：||PF₁| - |PF₂|| = 2a`}
            </div>
            <div className="text-slate-600 flex items-center gap-2 font-mono text-xs">
              {conic.conicType === 'parabola' && (
                <>
                  <span>|PF| = <strong className="text-emerald-700 font-bold">{pointPData.dist1.toFixed(3)}</strong></span>
                  <span>=</span>
                  <span>|PD| = <strong className="text-emerald-700 font-bold">{pointPData.dist2?.toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">✓ 恒成立</span>
                </>
              )}
              {conic.conicType === 'ellipse' && (
                <>
                  <span>d₁ + d₂ = <strong className="text-emerald-700 font-bold">{(pointPData.sum || 0).toFixed(3)}</strong></span>
                  <span>= 2a = <strong className="text-emerald-700 font-bold">{((conic.parameters.a || 0) * 2).toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">✓ 恒等于长轴长</span>
                </>
              )}
              {conic.conicType === 'hyperbola' && (
                <>
                  <span>|d₁ - d₂| = <strong className="text-emerald-700 font-bold">{(pointPData.diff || 0).toFixed(3)}</strong></span>
                  <span>= 2a = <strong className="text-emerald-700 font-bold">{((conic.parameters.a || 0) * 2).toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">✓ 恒等于实轴长</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Point P Slider */}
      {showProofPoint && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-xs sm:text-sm print-hide">
          <span className="text-slate-600 font-medium whitespace-nowrap">{t.dragPointNotice}</span>
          <input
            type="range"
            min="-6"
            max="6"
            step="0.1"
            value={curveParam}
            onChange={(e) => setCurveParam(parseFloat(e.target.value))}
            className="flex-1 accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-slate-800 font-bold w-12 text-right">
            {curveParam.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};
