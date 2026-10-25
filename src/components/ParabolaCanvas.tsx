import React, { useState, useMemo, useRef } from 'react';
import { ParabolaAnalysisResult } from '../utils/parabolaSolver.ts';
import { Language, translations } from '../i18n/translations.ts';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

interface ParabolaCanvasProps {
  parabola: ParabolaAnalysisResult;
  lang: Language;
}

export const ParabolaCanvas: React.FC<ParabolaCanvasProps> = ({ parabola, lang }) => {
  const t = translations[lang].canvas;

  const [zoom, setZoom] = useState(1);
  const [showProofPoint, setShowProofPoint] = useState(true);
  const [showLatusRectum, setShowLatusRectum] = useState(true);
  const [showGrid] = useState(true);
  
  const [curveParam, setCurveParam] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;

  const maxExtent = useMemo(() => {
    const coords = [
      Math.abs(parabola.vertex.x),
      Math.abs(parabola.vertex.y),
      Math.abs(parabola.focus.x),
      Math.abs(parabola.focus.y),
      Math.abs(parabola.directrix.val),
      parabola.p * 2
    ];
    const maxVal = Math.max(...coords, 4);
    return Math.min(Math.max(maxVal * 1.6, 6), 30);
  }, [parabola]);

  const baseScale = (Math.min(width, height) / (2 * maxExtent)) * zoom;
  const scale = Math.max(12, Math.min(baseScale, 100));

  const centerOffsetX = -parabola.vertex.x * scale * 0.4;
  const centerOffsetY = parabola.vertex.y * scale * 0.4;

  const toScreenX = (x: number) => cx + centerOffsetX + x * scale;
  const toScreenY = (y: number) => cy + centerOffsetY - y * scale;

  const fromScreenX = (sx: number) => (sx - (cx + centerOffsetX)) / scale;
  const fromScreenY = (sy: number) => -(sy - (cy + centerOffsetY)) / scale;

  const curvePath = useMemo(() => {
    const points: [number, number][] = [];
    const step = 0.15;
    const { orientation, direction, vertex, p } = parabola;
    const twoP = 2 * p;
    const tMax = Math.max(maxExtent * 1.8, 8);

    if (orientation === 'horizontal') {
      const dirSign = direction === 'right' ? 1 : -1;
      for (let tVal = -tMax; tVal <= tMax; tVal += step) {
        const y = vertex.y + tVal;
        const x = vertex.x + dirSign * ((tVal * tVal) / twoP);
        points.push([toScreenX(x), toScreenY(y)]);
      }
    } else {
      const dirSign = direction === 'up' ? 1 : -1;
      for (let tVal = -tMax; tVal <= tMax; tVal += step) {
        const x = vertex.x + tVal;
        const y = vertex.y + dirSign * ((tVal * tVal) / twoP);
        points.push([toScreenX(x), toScreenY(y)]);
      }
    }

    if (points.length < 2) return '';
    return 'M ' + points.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L ');
  }, [parabola, scale, centerOffsetX, centerOffsetY, maxExtent]);

  const pointP = useMemo(() => {
    const { orientation, direction, vertex, p } = parabola;
    const twoP = 2 * p;
    let px = 0;
    let py = 0;
    const tVal = curveParam;

    if (orientation === 'horizontal') {
      const dirSign = direction === 'right' ? 1 : -1;
      py = vertex.y + tVal;
      px = vertex.x + dirSign * ((tVal * tVal) / twoP);
    } else {
      const dirSign = direction === 'up' ? 1 : -1;
      px = vertex.x + tVal;
      py = vertex.y + dirSign * ((tVal * tVal) / twoP);
    }

    const distFocus = Math.sqrt((px - parabola.focus.x) ** 2 + (py - parabola.focus.y) ** 2);

    let footX = px;
    let footY = py;
    if (parabola.directrix.type === 'x') {
      footX = parabola.directrix.val;
      footY = py;
    } else {
      footX = px;
      footY = parabola.directrix.val;
    }

    const distDirectrix = Math.abs(
      parabola.directrix.type === 'x' ? px - parabola.directrix.val : py - parabola.directrix.val
    );

    return {
      x: px,
      y: py,
      footX,
      footY,
      distFocus,
      distDirectrix
    };
  }, [parabola, curveParam]);

  const latusRectumPoints = useMemo(() => {
    const { focus, orientation, p } = parabola;
    if (orientation === 'horizontal') {
      return {
        x1: focus.x,
        y1: focus.y + p,
        x2: focus.x,
        y2: focus.y - p
      };
    } else {
      return {
        x1: focus.x + p,
        y1: focus.y,
        x2: focus.x - p,
        y2: focus.y
      };
    }
  }, [parabola]);

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

    return { xTicks, yTicks, tickStep };
  }, [scale, centerOffsetX, centerOffsetY, width, height]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* Canvas Top Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-sky-600" />
          <span className="text-sm sm:text-base font-bold text-slate-900">
            {t.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
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

          {/* Toggle buttons */}
          <button
            onClick={() => setShowProofPoint(!showProofPoint)}
            className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showProofPoint
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.toggleProof} {showProofPoint ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowLatusRectum(!showLatusRectum)}
            className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showLatusRectum
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.toggleLatus} {showLatusRectum ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[400px] sm:h-[450px] bg-white select-none overflow-hidden" ref={containerRef}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ cursor: 'crosshair' }}
        >
          <defs>
            <marker
              id="axisArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
            </marker>
          </defs>

          {/* Background Grid */}
          {showGrid && (
            <g className="grid-layer">
              {gridTicks.xTicks.map((x) => (
                <line
                  key={`gx-${x}`}
                  x1={toScreenX(x)}
                  y1={0}
                  x2={toScreenX(x)}
                  y2={height}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
              ))}
              {gridTicks.yTicks.map((y) => (
                <line
                  key={`gy-${y}`}
                  x1={0}
                  y1={toScreenY(y)}
                  x2={width}
                  y2={toScreenY(y)}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Axis of Symmetry (Dotted Slate) */}
          {parabola.axisOfSymmetry.type === 'x' ? (
            <line
              x1={toScreenX(parabola.axisOfSymmetry.val)}
              y1={0}
              x2={toScreenX(parabola.axisOfSymmetry.val)}
              y2={height}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
          ) : (
            <line
              x1={0}
              y1={toScreenY(parabola.axisOfSymmetry.val)}
              x2={width}
              y2={toScreenY(parabola.axisOfSymmetry.val)}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
          )}

          {/* Cartesian Axes X and Y */}
          <line
            x1={0}
            y1={toScreenY(0)}
            x2={width}
            y2={toScreenY(0)}
            stroke="#64748B"
            strokeWidth="1.5"
            markerEnd="url(#axisArrow)"
          />
          <line
            x1={toScreenX(0)}
            y1={height}
            x2={toScreenX(0)}
            y2={0}
            stroke="#64748B"
            strokeWidth="1.5"
            markerEnd="url(#axisArrow)"
          />

          {/* Axis Labels */}
          <text
            x={width - 16}
            y={toScreenY(0) + 16}
            fontSize="13"
            fontWeight="bold"
            fill="#475569"
            fontFamily="system-ui"
          >
            x
          </text>
          <text
            x={toScreenX(0) + 10}
            y={16}
            fontSize="13"
            fontWeight="bold"
            fill="#475569"
            fontFamily="system-ui"
          >
            y
          </text>
          <text
            x={toScreenX(0) - 14}
            y={toScreenY(0) + 14}
            fontSize="11"
            fill="#94A3B8"
            fontFamily="JetBrains Mono, monospace"
          >
            O
          </text>

          {/* Grid Tick Numbers */}
          {gridTicks.xTicks.map((x) => {
            const sx = toScreenX(x);
            if (sx < 20 || sx > width - 20) return null;
            return (
              <g key={`tx-${x}`}>
                <line x1={sx} y1={toScreenY(0) - 3} x2={sx} y2={toScreenY(0) + 3} stroke="#64748B" />
                <text
                  x={sx}
                  y={toScreenY(0) + 14}
                  fontSize="10"
                  fill="#64748B"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {x}
                </text>
              </g>
            );
          })}
          {gridTicks.yTicks.map((y) => {
            const sy = toScreenY(y);
            if (sy < 20 || sy > height - 20) return null;
            return (
              <g key={`ty-${y}`}>
                <line x1={toScreenX(0) - 3} y1={sy} x2={toScreenX(0) + 3} y2={sy} stroke="#64748B" />
                <text
                  x={toScreenX(0) - 8}
                  y={sy + 3}
                  fontSize="10"
                  fill="#64748B"
                  textAnchor="end"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {/* Directrix - Rose Line */}
          {parabola.directrix.type === 'x' ? (
            <g>
              <line
                x1={toScreenX(parabola.directrix.val)}
                y1={0}
                x2={toScreenX(parabola.directrix.val)}
                y2={height}
                stroke="#E11D48"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <rect
                x={toScreenX(parabola.directrix.val) - 45}
                y={12}
                width="90"
                height="24"
                rx="4"
                fill="#FFF1F2"
                stroke="#FECDD3"
                strokeWidth="1"
              />
              <text
                x={toScreenX(parabola.directrix.val)}
                y={28}
                fontSize="12"
                fill="#BE123C"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="system-ui"
              >
                x = {parabola.directrix.val.toFixed(2).replace(/\.00$/, '')}
              </text>
            </g>
          ) : (
            <g>
              <line
                x1={0}
                y1={toScreenY(parabola.directrix.val)}
                x2={width}
                y2={toScreenY(parabola.directrix.val)}
                stroke="#E11D48"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <rect
                x={width - 110}
                y={toScreenY(parabola.directrix.val) - 26}
                width="95"
                height="22"
                rx="4"
                fill="#FFF1F2"
                stroke="#FECDD3"
                strokeWidth="1"
              />
              <text
                x={width - 62}
                y={toScreenY(parabola.directrix.val) - 10}
                fontSize="12"
                fill="#BE123C"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="system-ui"
              >
                y = {parabola.directrix.val.toFixed(2).replace(/\.00$/, '')}
              </text>
            </g>
          )}

          {/* Latus Rectum */}
          {showLatusRectum && (
            <g>
              <line
                x1={toScreenX(latusRectumPoints.x1)}
                y1={toScreenY(latusRectumPoints.y1)}
                x2={toScreenX(latusRectumPoints.x2)}
                y2={toScreenY(latusRectumPoints.y2)}
                stroke="#D97706"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <circle cx={toScreenX(latusRectumPoints.x1)} cy={toScreenY(latusRectumPoints.y1)} r="3.5" fill="#D97706" />
              <circle cx={toScreenX(latusRectumPoints.x2)} cy={toScreenY(latusRectumPoints.y2)} r="3.5" fill="#D97706" />
            </g>
          )}

          {/* Parabola Curve */}
          <path d={curvePath} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Focus Point F */}
          <g>
            <circle
              cx={toScreenX(parabola.focus.x)}
              cy={toScreenY(parabola.focus.y)}
              r="5.5"
              fill="#7C3AED"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <rect
              x={toScreenX(parabola.focus.x) + 8}
              y={toScreenY(parabola.focus.y) - 24}
              width="78"
              height="22"
              rx="4"
              fill="#F5F3FF"
              stroke="#DDD6FE"
              strokeWidth="1"
            />
            <text
              x={toScreenX(parabola.focus.x) + 47}
              y={toScreenY(parabola.focus.y) - 9}
              fontSize="12"
              fill="#6D28D9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              F({parabola.focus.x.toFixed(1).replace(/\.0$/, '')}, {parabola.focus.y.toFixed(1).replace(/\.0$/, '')})
            </text>
          </g>

          {/* Vertex Point V */}
          <g>
            <circle
              cx={toScreenX(parabola.vertex.x)}
              cy={toScreenY(parabola.vertex.y)}
              r="5"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <text
              x={toScreenX(parabola.vertex.x) - 10}
              y={toScreenY(parabola.vertex.y) + 16}
              fontSize="12"
              fill="#1E293B"
              fontWeight="bold"
              fontFamily="system-ui"
            >
              V({parabola.vertex.x.toFixed(1).replace(/\.0$/, '')}, {parabola.vertex.y.toFixed(1).replace(/\.0$/, '')})
            </text>
          </g>

          {/* Interactive Point P */}
          {showProofPoint && (
            <g>
              <line
                x1={toScreenX(pointP.x)}
                y1={toScreenY(pointP.y)}
                x2={toScreenX(parabola.focus.x)}
                y2={toScreenY(parabola.focus.y)}
                stroke="#10B981"
                strokeWidth="2"
              />
              <line
                x1={toScreenX(pointP.x)}
                y1={toScreenY(pointP.y)}
                x2={toScreenX(pointP.footX)}
                y2={toScreenY(pointP.footY)}
                stroke="#10B981"
                strokeWidth="2"
              />
              <circle cx={toScreenX(pointP.footX)} cy={toScreenY(pointP.footY)} r="4" fill="#E11D48" />
              <circle cx={toScreenX(pointP.x)} cy={toScreenY(pointP.y)} r="6.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={toScreenX(pointP.x) + 8}
                y={toScreenY(pointP.y) - 8}
                fontSize="12"
                fill="#047857"
                fontWeight="bold"
              >
                P({pointP.x.toFixed(2)}, {pointP.y.toFixed(2)})
              </text>
            </g>
          )}
        </svg>

        {/* Floating Definition Badge */}
        {showProofPoint && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-emerald-200 rounded-lg p-3 shadow-xs text-xs sm:text-sm">
            <div className="font-bold text-emerald-800 mb-1">
              {t.definitionProofTitle}
            </div>
            <div className="text-slate-600 flex items-center gap-3 font-mono text-xs">
              <span>|PF| = <strong className="text-emerald-700 font-bold">{pointP.distFocus.toFixed(3)}</strong></span>
              <span>=</span>
              <span>|PD| = <strong className="text-emerald-700 font-bold">{pointP.distDirectrix.toFixed(3)}</strong></span>
              <span className="text-emerald-600 font-sans font-bold">✓</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-2xs text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-sky-600 inline-block rounded-xs" />
            <span className="text-slate-700 font-medium">{t.curveLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            <span className="text-slate-700 font-medium">{t.focusLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-rose-500 border-b border-dashed border-rose-500 inline-block" />
            <span className="text-slate-700 font-medium">{t.directrixLabel}</span>
          </div>
          {showLatusRectum && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-amber-500 border-b border-dotted border-amber-500 inline-block" />
              <span className="text-slate-700 font-medium">{t.latusLabel} = {parabola.latusRectum.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Point P Slider */}
      {showProofPoint && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-xs sm:text-sm">
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
          <span className="font-mono text-slate-800 font-bold w-14 text-right">
            t = {curveParam.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};
