import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { Language, translations } from '../i18n/translations.ts';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Download,
  Layers,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';

interface ParabolaCanvasProps {
  conic: ConicAnalysisResult;
  lang: Language;
}

export const ParabolaCanvas: React.FC<ParabolaCanvasProps> = ({ conic, lang }) => {
  const t = translations[lang].canvas;

  // View state: zoom and pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panCurrentRef = useRef({ x: 0, y: 0 });

  // Direct dragging of Point P
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [curveParam, setCurveParam] = useState(2); // parameter t or angle theta

  // Layer switches
  const [layers, setLayers] = useState({
    curve: true,
    foci: true,
    directrix: true,
    axes: true,
    grid: true,
    proof: true
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Hover coordinate in math space
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;

  // Determine scale based on conic bounding box
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
  const scale = Math.max(8, Math.min(baseScale, 160));

  const centerOffsetX = -conic.centerOrVertex.x * scale * 0.4 + pan.x;
  const centerOffsetY = conic.centerOrVertex.y * scale * 0.4 + pan.y;

  const toScreenX = useCallback((x: number) => cx + centerOffsetX + x * scale, [cx, centerOffsetX, scale]);
  const toScreenY = useCallback((y: number) => cy + centerOffsetY - y * scale, [cy, centerOffsetY, scale]);

  const fromScreenX = useCallback((sx: number) => (sx - (cx + centerOffsetX)) / scale, [cx, centerOffsetX, scale]);
  const fromScreenY = useCallback((sy: number) => -(sy - (cy + centerOffsetY)) / scale, [cy, centerOffsetY, scale]);

  // Reset View handler
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Paths for Parabola, Ellipse, or Hyperbola
  const curvePaths = useMemo(() => {
    if (conic.conicType === 'parabola') {
      const points: [number, number][] = [];
      const step = 0.12;
      const orientation = conic.parameters.orientation || 'horizontal';
      const direction = conic.parameters.direction || 'right';
      const p = conic.parameters.p || 2;
      const twoP = 2 * p;
      const tMax = Math.max(maxExtent * 2.2, 10);

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
      const stepsCount = 120;
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
      const tMax = 2.4;
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
  }, [conic, maxExtent, toScreenX, toScreenY]);

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
    if (scale < 18) tickStep = 5;
    else if (scale < 35) tickStep = 2;
    else if (scale > 75) tickStep = 0.5;

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
  }, [scale, fromScreenX, fromScreenY, width, height]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(0.3, Math.min(z * factor, 4.0)));
  };

  // Convert client SVG coordinates to local SVG viewBox coordinates
  const getSVGCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, [width, height]);

  // Pointer interactions for Pan and Point P direct dragging
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSVGCoordinates(e.clientX, e.clientY);
    
    // Check if clicked near Point P (within 20px radius)
    if (pointPData && layers.proof) {
      const pScreenX = toScreenX(pointPData.px);
      const pScreenY = toScreenY(pointPData.py);
      const dist = Math.hypot(coords.x - pScreenX, coords.y - pScreenY);
      if (dist <= 24) {
        setIsDraggingPoint(true);
        (e.target as Element).setPointerCapture?.(e.pointerId);
        return;
      }
    }

    // Otherwise, start canvas pan
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panCurrentRef.current = { ...pan };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSVGCoordinates(e.clientX, e.clientY);
    const mathX = fromScreenX(coords.x);
    const mathY = fromScreenY(coords.y);
    setHoverCoord({ x: mathX, y: mathY });

    if (isDraggingPoint) {
      // Map mouse coordinate to curve parameter
      if (conic.conicType === 'parabola') {
        const orientation = conic.parameters.orientation || 'horizontal';
        if (orientation === 'horizontal') {
          // parameter is y offset
          const newParam = Math.max(-10, Math.min(10, mathY - conic.centerOrVertex.y));
          setCurveParam(newParam);
        } else {
          // parameter is x offset
          const newParam = Math.max(-10, Math.min(10, mathX - conic.centerOrVertex.x));
          setCurveParam(newParam);
        }
      } else if (conic.conicType === 'ellipse') {
        const dx = mathX - conic.centerOrVertex.x;
        const dy = mathY - conic.centerOrVertex.y;
        const angle = Math.atan2(dy, dx);
        setCurveParam((angle / Math.PI) * 6);
      } else if (conic.conicType === 'hyperbola') {
        const dy = mathY - conic.centerOrVertex.y;
        const newParam = Math.max(-6, Math.min(6, dy * 0.8));
        setCurveParam(newParam);
      }
      return;
    }

    if (isPanning) {
      const dx = (e.clientX - panStartRef.current.x) * (width / (svgRef.current?.clientWidth || width));
      const dy = (e.clientY - panStartRef.current.y) * (height / (svgRef.current?.clientHeight || height));
      setPan({
        x: panCurrentRef.current.x + dx,
        y: panCurrentRef.current.y + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingPoint) {
      setIsDraggingPoint(false);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    }
    if (isPanning) {
      setIsPanning(false);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    }
  };

  // Export high-resolution PNG image
  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const exportCanvas = document.createElement('canvas');
      const scaleFactor = 2; // high res 2x
      exportCanvas.width = width * scaleFactor;
      exportCanvas.height = height * scaleFactor;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        ctx.drawImage(image, 0, 0, exportCanvas.width, exportCanvas.height);
        
        const pngURL = exportCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngURL;
        downloadLink.download = `conic_${conic.conicType}_graph.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URLObject.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* Canvas Top Bar */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 print-hide">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-sky-600" />
          <span className="text-sm sm:text-base font-bold text-slate-900">
            {t.title}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline ml-1 font-normal">
            ({lang === 'zh' ? '支持鼠标滚轮缩放、拖拽平移、直拖动点' : 'Wheel zoom, drag to pan, drag point P'})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom & Pan Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.25, 4))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z * 0.8, 0.3))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
              title={t.resetView}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Layer toggles dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors shadow-2xs ${
                showLayerMenu ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'zh' ? '图层开关' : 'Layers'}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-30 space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 px-1 pb-1 border-b border-slate-100">
                  {lang === 'zh' ? '图形图层显示' : 'Display Layers'}
                </div>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.curve}
                    onChange={(e) => setLayers((l) => ({ ...l, curve: e.target.checked }))}
                    className="accent-sky-600 rounded"
                  />
                  <span>{lang === 'zh' ? '曲线轨迹' : 'Conic Curve'}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.foci}
                    onChange={(e) => setLayers((l) => ({ ...l, foci: e.target.checked }))}
                    className="accent-purple-600 rounded"
                  />
                  <span>{lang === 'zh' ? '焦点与顶点' : 'Foci & Vertices'}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.directrix}
                    onChange={(e) => setLayers((l) => ({ ...l, directrix: e.target.checked }))}
                    className="accent-rose-600 rounded"
                  />
                  <span>{lang === 'zh' ? '准线方程' : 'Directrices'}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.axes}
                    onChange={(e) => setLayers((l) => ({ ...l, axes: e.target.checked }))}
                    className="accent-slate-600 rounded"
                  />
                  <span>{lang === 'zh' ? '对称轴' : 'Axes of Symmetry'}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.grid}
                    onChange={(e) => setLayers((l) => ({ ...l, grid: e.target.checked }))}
                    className="accent-slate-600 rounded"
                  />
                  <span>{lang === 'zh' ? '网格与坐标刻度' : 'Grid & Ticks'}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.proof}
                    onChange={(e) => setLayers((l) => ({ ...l, proof: e.target.checked }))}
                    className="accent-emerald-600 rounded"
                  />
                  <span>{lang === 'zh' ? '动点 P 与定义连线' : 'Point P Proof Lines'}</span>
                </label>
              </div>
            )}
          </div>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
            title={lang === 'zh' ? '导出高清画板图片 (PNG)' : 'Export High-Res PNG'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{lang === 'zh' ? '保存图片' : 'Export PNG'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area with Pan & Drag */}
      <div
        className="relative w-full h-[420px] sm:h-[480px] bg-white select-none overflow-hidden touch-none"
        ref={containerRef}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ cursor: isDraggingPoint ? 'grabbing' : isPanning ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background rect for clean PNG export */}
          <rect width={width} height={height} fill="#FFFFFF" />

          {/* Grid lines */}
          {layers.grid && (
            <g className="grid-layer">
              {gridTicks.xTicks.map((x) => (
                <line key={`gx-${x}`} x1={toScreenX(x)} y1={0} x2={toScreenX(x)} y2={height} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              {gridTicks.yTicks.map((y) => (
                <line key={`gy-${y}`} x1={0} y1={toScreenY(y)} x2={width} y2={toScreenY(y)} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              {/* Tick numbers */}
              {gridTicks.xTicks.map((x) => (
                <text key={`tx-${x}`} x={toScreenX(x)} y={Math.max(14, Math.min(height - 6, toScreenY(0) + 14))} fontSize="9" fill="#94A3B8" textAnchor="middle">
                  {x}
                </text>
              ))}
              {gridTicks.yTicks.map((y) => (
                <text key={`ty-${y}`} x={Math.max(16, Math.min(width - 16, toScreenX(0) - 8))} y={toScreenY(y) + 3} fontSize="9" fill="#94A3B8" textAnchor="end">
                  {y}
                </text>
              ))}
            </g>
          )}

          {/* Axes of Symmetry */}
          {layers.axes &&
            conic.axesOfSymmetry.map((axis, idx) => (
              <line
                key={`sym-${idx}`}
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
          {layers.grid && (
            <g>
              <line x1={0} y1={toScreenY(0)} x2={width} y2={toScreenY(0)} stroke="#64748B" strokeWidth="1.5" />
              <line x1={toScreenX(0)} y1={height} x2={toScreenX(0)} y2={0} stroke="#64748B" strokeWidth="1.5" />
              <text x={width - 16} y={toScreenY(0) + 16} fontSize="13" fontWeight="bold" fill="#475569">x</text>
              <text x={toScreenX(0) + 10} y={16} fontSize="13" fontWeight="bold" fill="#475569">y</text>
              <text x={toScreenX(0) - 10} y={toScreenY(0) + 14} fontSize="10" fill="#64748B">O</text>
            </g>
          )}

          {/* Directrices */}
          {layers.directrix &&
            conic.directrices.map((d, idx) => (
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
                <text
                  x={d.type === 'x' ? toScreenX(d.val) + 6 : 20}
                  y={d.type === 'x' ? 24 : toScreenY(d.val) - 6}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#E11D48"
                >
                  l: {d.type}={d.val.toFixed(2).replace(/\.00$/, '')}
                </text>
              </g>
            ))}

          {/* Conic Curve(s) */}
          {layers.curve &&
            curvePaths.map((pathStr, idx) => (
              <path key={idx} d={pathStr} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
            ))}

          {/* Center or Vertex */}
          {layers.foci && (
            <g>
              <circle
                cx={toScreenX(conic.centerOrVertex.x)}
                cy={toScreenY(conic.centerOrVertex.y)}
                r="5"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text
                x={toScreenX(conic.centerOrVertex.x) - 10}
                y={toScreenY(conic.centerOrVertex.y) + 16}
                fontSize="12"
                fontWeight="bold"
                fill="#1E293B"
              >
                {conic.centerOrVertex.label}({conic.centerOrVertex.x.toFixed(1).replace(/\.0$/, '')}, {conic.centerOrVertex.y.toFixed(1).replace(/\.0$/, '')})
              </text>
            </g>
          )}

          {/* Foci */}
          {layers.foci &&
            conic.foci.map((f, idx) => (
              <g key={`f-${idx}`}>
                <circle cx={toScreenX(f.x)} cy={toScreenY(f.y)} r="5.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x={toScreenX(f.x) + 8} y={toScreenY(f.y) - 8} fontSize="11" fontWeight="bold" fill="#6D28D9">
                  {f.label}({f.x.toFixed(1).replace(/\.0$/, '')}, {f.y.toFixed(1).replace(/\.0$/, '')})
                </text>
              </g>
            ))}

          {/* Interactive Point P on Curve & Proof Lines */}
          {layers.proof && pointPData && (
            <g>
              {conic.conicType === 'parabola' && (
                <>
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(conic.foci[0]?.x || 0)}
                    y2={toScreenY(conic.foci[0]?.y || 0)}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.footX || 0)}
                    y2={toScreenY(pointPData.footY || 0)}
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <circle cx={toScreenX(pointPData.footX || 0)} cy={toScreenY(pointPData.footY || 0)} r="3" fill="#10B981" />
                </>
              )}
              {conic.conicType === 'ellipse' && pointPData.f1 && pointPData.f2 && (
                <>
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.f1.x)}
                    y2={toScreenY(pointPData.f1.y)}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.f2.x)}
                    y2={toScreenY(pointPData.f2.y)}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                </>
              )}
              {conic.conicType === 'hyperbola' && pointPData.f1 && pointPData.f2 && (
                <>
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.f1.x)}
                    y2={toScreenY(pointPData.f1.y)}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.f2.x)}
                    y2={toScreenY(pointPData.f2.y)}
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Point P interactive circle handle */}
              <circle
                cx={toScreenX(pointPData.px)}
                cy={toScreenY(pointPData.py)}
                r="7"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                style={{ cursor: 'grab', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
              <text
                x={toScreenX(pointPData.px) + 10}
                y={toScreenY(pointPData.py) - 10}
                fontSize="12"
                fill="#047857"
                fontWeight="bold"
              >
                P({pointPData.px.toFixed(2)}, {pointPData.py.toFixed(2)})
              </text>
            </g>
          )}
        </svg>

        {/* Live Cursor Coordinate Readout */}
        {hoverCoord && (
          <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded-md shadow-xs pointer-events-none">
            x: {hoverCoord.x.toFixed(2)}, y: {hoverCoord.y.toFixed(2)}
          </div>
        )}

        {/* Floating Definition Verification Badge */}
        {layers.proof && pointPData && (
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

      {/* Point P Slider & Direct Control */}
      {layers.proof && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-xs sm:text-sm print-hide">
          <span className="text-slate-600 font-medium whitespace-nowrap">
            {lang === 'zh' ? '动点 P 参数调节（亦可直接在画布拖拽点 P）：' : 'Adjust Point P (or drag point P on canvas):'}
          </span>
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
