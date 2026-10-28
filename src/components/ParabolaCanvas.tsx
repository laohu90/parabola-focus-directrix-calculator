import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ConicAnalysisResult } from '../utils/conicTypes.ts';
import { Language, translations } from '../i18n/translations.ts';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Download,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ParabolaCanvasProps {
  conic: ConicAnalysisResult;
  lang: Language;
}

// Helper interface for point screen coordinates
interface ScreenPoint {
  x: number;
  y: number;
  label: string;
}

// Dynamic label positioning helper to prevent label overlaps in SVG canvas
interface LabelStyle {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
}

function calculateSmartLabel(
  target: ScreenPoint,
  otherPoints: ScreenPoint[],
  defaultDx = 10,
  defaultDy = -8,
  defaultAnchor: 'start' | 'middle' | 'end' = 'start'
): LabelStyle {
  let dx = defaultDx;
  let dy = defaultDy;
  let anchor = defaultAnchor;

  for (const other of otherPoints) {
    const dist = Math.hypot(target.x - other.x, target.y - other.y);
    if (dist < 45 && dist > 0.1) {
      // Points are too close! Adjust position based on relative quadrant
      if (target.x < other.x) {
        dx = -Math.abs(defaultDx) - 8;
        anchor = 'end';
      } else if (target.x > other.x) {
        dx = Math.abs(defaultDx) + 8;
        anchor = 'start';
      }

      if (target.y < other.y) {
        dy = -Math.abs(defaultDy) - 6;
      } else if (target.y > other.y) {
        dy = Math.abs(defaultDy) + 14;
      }
    }
  }

  return {
    x: target.x + dx,
    y: target.y + dy,
    textAnchor: anchor
  };
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
    proof: true,
    latus: true,
    dimensions: true
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

  // Determine scale and bounding box dynamically based on conic's actual geometry
  const { boxCenter, baseScale, maxExtent } = useMemo(() => {
    const xs: number[] = [conic.centerOrVertex.x];
    const ys: number[] = [conic.centerOrVertex.y];

    conic.foci.forEach((f) => {
      xs.push(f.x);
      ys.push(f.y);
    });

    conic.vertices.forEach((v) => {
      xs.push(v.x);
      ys.push(v.y);
    });

    conic.directrices.forEach((d) => {
      if (d.type === 'x') xs.push(d.val);
      if (d.type === 'y') ys.push(d.val);
    });

    if (conic.conicType === 'ellipse') {
      const a = conic.parameters.a || 3;
      const b = conic.parameters.b || 2;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const rx = isHoriz ? a : b;
      const ry = isHoriz ? b : a;
      xs.push(conic.centerOrVertex.x - rx, conic.centerOrVertex.x + rx);
      ys.push(conic.centerOrVertex.y - ry, conic.centerOrVertex.y + ry);
    } else if (conic.conicType === 'parabola') {
      const p = conic.parameters.p || 2;
      const orientation = conic.parameters.orientation || 'horizontal';
      const direction = conic.parameters.direction || 'right';
      if (orientation === 'horizontal') {
        const sign = direction === 'right' ? 1 : -1;
        xs.push(conic.centerOrVertex.x + sign * p * 1.2);
        ys.push(conic.centerOrVertex.y - p * 1.2, conic.centerOrVertex.y + p * 1.2);
      } else {
        const sign = direction === 'up' ? 1 : -1;
        ys.push(conic.centerOrVertex.y + sign * p * 1.2);
        xs.push(conic.centerOrVertex.x - p * 1.2, conic.centerOrVertex.x + p * 1.2);
      }
    } else if (conic.conicType === 'hyperbola') {
      const a = conic.parameters.a || 3;
      const b = conic.parameters.b || 2;
      xs.push(conic.centerOrVertex.x - a * 1.5, conic.centerOrVertex.x + a * 1.5);
      ys.push(conic.centerOrVertex.y - b * 1.5, conic.centerOrVertex.y + b * 1.5);
    }

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = Math.max(maxX - minX, 2);
    const spanY = Math.max(maxY - minY, 2);
    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    // Leave generous margins (~35%) so labels, axes, and directrices are clearly visible
    const padX = spanX * 1.45 + 1;
    const padY = spanY * 1.45 + 1;

    const scaleX = width / padX;
    const scaleY = height / padY;
    const calculatedBaseScale = Math.min(scaleX, scaleY);
    const clampedBaseScale = Math.max(8, Math.min(calculatedBaseScale, 120));

    const extent = Math.max(spanX, spanY) / 2;

    return {
      boxCenter: { x: boxCenterX, y: boxCenterY },
      baseScale: clampedBaseScale,
      maxExtent: Math.max(extent * 2.5, 8)
    };
  }, [conic, width, height]);

  const scale = Math.max(6, Math.min(baseScale * zoom, 240));

  const centerOffsetX = -boxCenter.x * scale + pan.x;
  const centerOffsetY = boxCenter.y * scale + pan.y;

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

  // Parabola Latus Rectum Endpoints & Half-P dimension lines
  const parabolaDetails = useMemo(() => {
    if (conic.conicType !== 'parabola') return null;
    const focus = conic.foci[0] || { x: 0, y: 0 };
    const vertex = conic.centerOrVertex;
    const directrix = conic.directrices[0] || { type: 'x', val: 0 };
    const p = conic.parameters.p || 2;
    const halfP = p / 2;
    const orientation = conic.parameters.orientation || 'horizontal';
    const direction = conic.parameters.direction || 'right';

    let l1 = { x: 0, y: 0 };
    let l2 = { x: 0, y: 0 };

    if (orientation === 'horizontal') {
      l1 = { x: focus.x, y: focus.y + p };
      l2 = { x: focus.x, y: focus.y - p };
    } else {
      l1 = { x: focus.x + p, y: focus.y };
      l2 = { x: focus.x - p, y: focus.y };
    }

    const dirFoot = {
      x: directrix.type === 'x' ? directrix.val : vertex.x,
      y: directrix.type === 'y' ? directrix.val : vertex.y
    };

    return { focus, vertex, directrix, p, halfP, l1, l2, dirFoot, orientation, direction };
  }, [conic]);

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
      const directrixWord =
        lang === 'zh'
          ? '准线'
          : lang === 'fr'
            ? 'directrice'
            : lang === 'es'
              ? 'directriz'
              : lang === 'pt'
                ? 'diretriz'
                : 'directrix';
      return { px, py, footX, footY, dist1: distF, dist2: distD, label: `|PF| = d(P, ${directrixWord})` };
    }

    if (conicType === 'ellipse') {
      const a = conic.parameters.a || 4;
      const b = conic.parameters.b || 3;
      const isHoriz = conic.parameters.orientation === 'horizontal';
      const theta = (curveParam / 6) * Math.PI;
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
  }, [conic, curveParam, lang]);

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

  // Compute screen points & anti-collision label positions
  const labelPositions = useMemo(() => {
    const allScreenPts: ScreenPoint[] = [];

    // 1. Main Center / Primary Vertex
    const centerPt: ScreenPoint = {
      x: toScreenX(conic.centerOrVertex.x),
      y: toScreenY(conic.centerOrVertex.y),
      label: conic.centerOrVertex.label
    };
    allScreenPts.push(centerPt);

    // 2. Vertices (V1, V2, etc)
    const vertexPts: ScreenPoint[] = conic.vertices.map((v) => ({
      x: toScreenX(v.x),
      y: toScreenY(v.y),
      label: v.label
    }));
    allScreenPts.push(...vertexPts);

    // 3. Foci
    const fociPts: ScreenPoint[] = conic.foci.map((f) => ({
      x: toScreenX(f.x),
      y: toScreenY(f.y),
      label: f.label
    }));
    allScreenPts.push(...fociPts);

    // 4. Latus Rectum endpoints
    let l1Pt: ScreenPoint | null = null;
    let l2Pt: ScreenPoint | null = null;
    if (parabolaDetails) {
      l1Pt = {
        x: toScreenX(parabolaDetails.l1.x),
        y: toScreenY(parabolaDetails.l1.y),
        label: 'L₁'
      };
      l2Pt = {
        x: toScreenX(parabolaDetails.l2.x),
        y: toScreenY(parabolaDetails.l2.y),
        label: 'L₂'
      };
      allScreenPts.push(l1Pt, l2Pt);
    }

    // 5. Point P
    let pointPPt: ScreenPoint | null = null;
    if (pointPData) {
      pointPPt = {
        x: toScreenX(pointPData.px),
        y: toScreenY(pointPData.py),
        label: 'P'
      };
      allScreenPts.push(pointPPt);
    }

    // Calculate smart anti-collision label styles
    const isVertMajor = conic.conicType === 'ellipse' && conic.parameters.orientation === 'vertical';
    const isHorizMajor = conic.conicType === 'ellipse' && conic.parameters.orientation === 'horizontal';

    const centerStyle = isVertMajor
      ? { x: centerPt.x - 14, y: centerPt.y + 4, textAnchor: 'end' as const }
      : isHorizMajor
        ? { x: centerPt.x, y: centerPt.y - 12, textAnchor: 'middle' as const }
        : calculateSmartLabel(
            centerPt,
            allScreenPts.filter((p) => p !== centerPt),
            -12,
            18,
            'end'
          );

    const vertexStyles = vertexPts.map((pt) => {
      if (isVertMajor) {
        const isTop = pt.y < centerPt.y;
        return {
          x: pt.x,
          y: isTop ? pt.y - 10 : pt.y + 16,
          textAnchor: 'middle' as const
        };
      }
      if (isHorizMajor) {
        const isLeft = pt.x < centerPt.x;
        return {
          x: isLeft ? pt.x - 12 : pt.x + 12,
          y: pt.y + 4,
          textAnchor: isLeft ? ('end' as const) : ('start' as const)
        };
      }
      return calculateSmartLabel(
        pt,
        allScreenPts.filter((p) => p !== pt),
        pt.x < centerPt.x ? -10 : 10,
        -8,
        pt.x < centerPt.x ? 'end' : 'start'
      );
    });

    const fociStyles = fociPts.map((pt) => {
      if (isVertMajor) {
        return {
          x: pt.x + 12,
          y: pt.y + 4,
          textAnchor: 'start' as const
        };
      }
      if (isHorizMajor) {
        return {
          x: pt.x,
          y: pt.y + 16,
          textAnchor: 'middle' as const
        };
      }
      return calculateSmartLabel(
        pt,
        allScreenPts.filter((p) => p !== pt),
        pt.x < centerPt.x ? -10 : 10,
        -8,
        pt.x < centerPt.x ? 'end' : 'start'
      );
    });

    const l1Style = l1Pt
      ? calculateSmartLabel(
          l1Pt,
          allScreenPts.filter((p) => p !== l1Pt),
          10,
          -6,
          'start'
        )
      : null;

    const l2Style = l2Pt
      ? calculateSmartLabel(
          l2Pt,
          allScreenPts.filter((p) => p !== l2Pt),
          10,
          14,
          'start'
        )
      : null;

    const pStyle = pointPPt
      ? calculateSmartLabel(
          pointPPt,
          allScreenPts.filter((p) => p !== pointPPt),
          12,
          -10,
          'start'
        )
      : null;

    return {
      centerStyle,
      vertexStyles,
      fociStyles,
      l1Style,
      l2Style,
      pStyle
    };
  }, [conic, parabolaDetails, pointPData, toScreenX, toScreenY]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(0.3, Math.min(z * factor, 4.0)));
  };

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

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSVGCoordinates(e.clientX, e.clientY);

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
      if (conic.conicType === 'parabola') {
        const orientation = conic.parameters.orientation || 'horizontal';
        if (orientation === 'horizontal') {
          const newParam = Math.max(-10, Math.min(10, mathY - conic.centerOrVertex.y));
          setCurveParam(newParam);
        } else {
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
      const scaleFactor = 2;
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
        downloadLink.download = `${conic.conicType}_focus_directrix_graph.png`;
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
          <div>
            <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight">
              {t.title}
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {t.subtitle}
            </span>
          </div>
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
              <span>{t.layerMenu}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-30 space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 px-1 pb-1 border-b border-slate-100">
                  {t.layerMenuTitle}
                </div>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.curve}
                    onChange={(e) => setLayers((l) => ({ ...l, curve: e.target.checked }))}
                    className="accent-sky-600 rounded"
                  />
                  <span>{t.layerConic}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.foci}
                    onChange={(e) => setLayers((l) => ({ ...l, foci: e.target.checked }))}
                    className="accent-purple-600 rounded"
                  />
                  <span>{t.layerFocusVertex}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.directrix}
                    onChange={(e) => setLayers((l) => ({ ...l, directrix: e.target.checked }))}
                    className="accent-rose-600 rounded"
                  />
                  <span>{t.layerDirectrix}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.latus}
                    onChange={(e) => setLayers((l) => ({ ...l, latus: e.target.checked }))}
                    className="accent-amber-600 rounded"
                  />
                  <span>{t.layerLatus}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.dimensions}
                    onChange={(e) => setLayers((l) => ({ ...l, dimensions: e.target.checked }))}
                    className="accent-indigo-600 rounded"
                  />
                  <span>{t.layerDimensions}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.grid}
                    onChange={(e) => setLayers((l) => ({ ...l, grid: e.target.checked }))}
                    className="accent-slate-600 rounded"
                  />
                  <span>{t.layerGrid}</span>
                </label>
                <label className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers.proof}
                    onChange={(e) => setLayers((l) => ({ ...l, proof: e.target.checked }))}
                    className="accent-emerald-600 rounded"
                  />
                  <span>{t.layerProof}</span>
                </label>
              </div>
            )}
          </div>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
            title={t.exportPng}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t.exportPng}</span>
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

          {/* Grid lines & Ticks */}
          {layers.grid && (
            <g className="grid-layer">
              {gridTicks.xTicks.map((x) => (
                <line key={`gx-${x}`} x1={toScreenX(x)} y1={0} x2={toScreenX(x)} y2={height} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              {gridTicks.yTicks.map((y) => (
                <line key={`gy-${y}`} x1={0} y1={toScreenY(y)} x2={width} y2={toScreenY(y)} stroke="#F1F5F9" strokeWidth="1" />
              ))}
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
              <g key={`sym-${idx}`}>
                <line
                  x1={axis.type === 'x' ? toScreenX(axis.val) : 0}
                  y1={axis.type === 'x' ? 0 : toScreenY(axis.val)}
                  x2={axis.type === 'x' ? toScreenX(axis.val) : width}
                  y2={axis.type === 'x' ? height : toScreenY(axis.val)}
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />
                <text
                  x={axis.type === 'x' ? toScreenX(axis.val) + 6 : width - 75}
                  y={axis.type === 'x' ? 36 : toScreenY(axis.val) - 6}
                  fontSize="10"
                  fill="#64748B"
                  fontWeight="bold"
                >
                  {t.axisLabel}: {axis.type}={axis.val.toFixed(1).replace(/\.0$/, '')}
                </text>
              </g>
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

          {/* Directrix Line & Intercept Tag */}
          {layers.directrix &&
            conic.directrices.map((d, idx) => (
              <g key={`d-${idx}`}>
                <line
                  x1={d.type === 'x' ? toScreenX(d.val) : 0}
                  y1={d.type === 'x' ? 0 : toScreenY(d.val)}
                  x2={d.type === 'x' ? toScreenX(d.val) : width}
                  y2={d.type === 'x' ? height : toScreenY(d.val)}
                  stroke="#E11D48"
                  strokeWidth="2.2"
                  strokeDasharray="6,4"
                />
                {/* Directrix Label Badge */}
                <rect
                  x={d.type === 'x' ? toScreenX(d.val) + 4 : 20}
                  y={d.type === 'x' ? 14 : toScreenY(d.val) - 22}
                  width="115"
                  height="18"
                  rx="4"
                  fill="#FFE4E6"
                  stroke="#FDA4AF"
                  strokeWidth="1"
                />
                <text
                  x={d.type === 'x' ? toScreenX(d.val) + 8 : 24}
                  y={d.type === 'x' ? 27 : toScreenY(d.val) - 9}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#BE123C"
                >
                  {t.directrixLabel}: {d.type}={d.val.toFixed(2).replace(/\.00$/, '')}
                </text>
              </g>
            ))}

          {/* Latus Rectum Chord (通径) for Parabola */}
          {layers.latus && parabolaDetails && labelPositions.l1Style && labelPositions.l2Style && (
            <g className="latus-rectum-layer">
              <line
                x1={toScreenX(parabolaDetails.l1.x)}
                y1={toScreenY(parabolaDetails.l1.y)}
                x2={toScreenX(parabolaDetails.l2.x)}
                y2={toScreenY(parabolaDetails.l2.y)}
                stroke="#D97706"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <circle cx={toScreenX(parabolaDetails.l1.x)} cy={toScreenY(parabolaDetails.l1.y)} r="3.5" fill="#D97706" />
              <circle cx={toScreenX(parabolaDetails.l2.x)} cy={toScreenY(parabolaDetails.l2.y)} r="3.5" fill="#D97706" />
              <text
                x={labelPositions.l1Style.x}
                y={labelPositions.l1Style.y}
                textAnchor={labelPositions.l1Style.textAnchor}
                fontSize="10"
                fill="#B45309"
                fontWeight="bold"
              >
                L₁({parabolaDetails.l1.x.toFixed(1)}, {parabolaDetails.l1.y.toFixed(1)})
              </text>
              <text
                x={labelPositions.l2Style.x}
                y={labelPositions.l2Style.y}
                textAnchor={labelPositions.l2Style.textAnchor}
                fontSize="10"
                fill="#B45309"
                fontWeight="bold"
              >
                L₂({parabolaDetails.l2.x.toFixed(1)}, {parabolaDetails.l2.y.toFixed(1)})
              </text>
              <text
                x={toScreenX((parabolaDetails.l1.x + parabolaDetails.l2.x) / 2) + 8}
                y={toScreenY((parabolaDetails.l1.y + parabolaDetails.l2.y) / 2) + 14}
                fontSize="10"
                fill="#B45309"
                fontWeight="bold"
              >
                {t.latusLength} = {(parabolaDetails.p * 2).toFixed(2).replace(/\.00$/, '')}
              </text>
            </g>
          )}

          {/* Semi-distance p/2 dimension markers from Vertex to Focus and Directrix */}
          {layers.dimensions && parabolaDetails && (
            <g className="dimensions-layer">
              {/* Vertex to Focus dimension segment */}
              <line
                x1={toScreenX(parabolaDetails.vertex.x)}
                y1={toScreenY(parabolaDetails.vertex.y)}
                x2={toScreenX(parabolaDetails.focus.x)}
                y2={toScreenY(parabolaDetails.focus.y)}
                stroke="#4F46E5"
                strokeWidth="2.5"
              />
              <text
                x={toScreenX((parabolaDetails.vertex.x + parabolaDetails.focus.x) / 2)}
                y={toScreenY((parabolaDetails.vertex.y + parabolaDetails.focus.y) / 2) - 8}
                fontSize="11"
                fill="#4338CA"
                fontWeight="bold"
                textAnchor="middle"
              >
                p/2 = {parabolaDetails.halfP.toFixed(2).replace(/\.00$/, '')}
              </text>

              {/* Vertex to Directrix dimension segment */}
              <line
                x1={toScreenX(parabolaDetails.vertex.x)}
                y1={toScreenY(parabolaDetails.vertex.y)}
                x2={toScreenX(parabolaDetails.dirFoot.x)}
                y2={toScreenY(parabolaDetails.dirFoot.y)}
                stroke="#BE123C"
                strokeWidth="2"
                strokeDasharray="2,2"
              />
              <text
                x={toScreenX((parabolaDetails.vertex.x + parabolaDetails.dirFoot.x) / 2)}
                y={toScreenY((parabolaDetails.vertex.y + parabolaDetails.dirFoot.y) / 2) - 8}
                fontSize="11"
                fill="#BE123C"
                fontWeight="bold"
                textAnchor="middle"
              >
                p/2 = {parabolaDetails.halfP.toFixed(2).replace(/\.00$/, '')}
              </text>
            </g>
          )}

          {/* Conic Curve(s) */}
          {layers.curve &&
            curvePaths.map((pathStr, idx) => (
              <path key={idx} d={pathStr} fill="none" stroke="#0284C7" strokeWidth="2.8" strokeLinecap="round" />
            ))}

          {/* Center or Main Vertex with Coordinate Droplines & Anti-overlap Label */}
          {layers.foci && (
            <g>
              <line
                x1={toScreenX(conic.centerOrVertex.x)}
                y1={toScreenY(conic.centerOrVertex.y)}
                x2={toScreenX(conic.centerOrVertex.x)}
                y2={toScreenY(0)}
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <line
                x1={toScreenX(conic.centerOrVertex.x)}
                y1={toScreenY(conic.centerOrVertex.y)}
                x2={toScreenX(0)}
                y2={toScreenY(conic.centerOrVertex.y)}
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              <circle
                cx={toScreenX(conic.centerOrVertex.x)}
                cy={toScreenY(conic.centerOrVertex.y)}
                r="6"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={labelPositions.centerStyle.x}
                y={labelPositions.centerStyle.y}
                textAnchor={labelPositions.centerStyle.textAnchor}
                fontSize="12"
                fontWeight="bold"
                fill="#0F172A"
                style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3.5px', strokeLinejoin: 'round' }}
              >
                {conic.centerOrVertex.label}({conic.centerOrVertex.x.toFixed(1).replace(/\.0$/, '')}, {conic.centerOrVertex.y.toFixed(1).replace(/\.0$/, '')})
              </text>
            </g>
          )}

          {/* Additional Vertices (V1, V2) if present */}
          {layers.foci &&
            conic.vertices.map((v, idx) => {
              const style = labelPositions.vertexStyles[idx];
              if (!style) return null;
              return (
                <g key={`v-${idx}`}>
                  <circle cx={toScreenX(v.x)} cy={toScreenY(v.y)} r="5.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  <text
                    x={style.x}
                    y={style.y}
                    textAnchor={style.textAnchor}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#1D4ED8"
                    style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3.5px', strokeLinejoin: 'round' }}
                  >
                    {v.label}({v.x.toFixed(1).replace(/\.0$/, '')}, {v.y.toFixed(1).replace(/\.0$/, '')})
                  </text>
                </g>
              );
            })}

          {/* Foci with Coordinate Droplines & Anti-overlap Labels */}
          {layers.foci &&
            conic.foci.map((f, idx) => {
              const style = labelPositions.fociStyles[idx];
              if (!style) return null;
              return (
                <g key={`f-${idx}`}>
                  <line
                    x1={toScreenX(f.x)}
                    y1={toScreenY(f.y)}
                    x2={toScreenX(f.x)}
                    y2={toScreenY(0)}
                    stroke="#E9D5FF"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <line
                    x1={toScreenX(f.x)}
                    y1={toScreenY(f.y)}
                    x2={toScreenX(0)}
                    y2={toScreenY(f.y)}
                    stroke="#E9D5FF"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />

                  <circle cx={toScreenX(f.x)} cy={toScreenY(f.y)} r="6.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                  <text
                    x={style.x}
                    y={style.y}
                    textAnchor={style.textAnchor}
                    fontSize="12"
                    fontWeight="bold"
                    fill="#6D28D9"
                    style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3.5px', strokeLinejoin: 'round' }}
                  >
                    {f.label}({f.x.toFixed(1).replace(/\.0$/, '')}, {f.y.toFixed(1).replace(/\.0$/, '')})
                  </text>
                </g>
              );
            })}

          {/* Interactive Point P on Curve & Proof Lines */}
          {layers.proof && pointPData && labelPositions.pStyle && (
            <g>
              {conic.conicType === 'parabola' && (
                <>
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(conic.foci[0]?.x || 0)}
                    y2={toScreenY(conic.foci[0]?.y || 0)}
                    stroke="#10B981"
                    strokeWidth="2.2"
                  />
                  <line
                    x1={toScreenX(pointPData.px)}
                    y1={toScreenY(pointPData.py)}
                    x2={toScreenX(pointPData.footX || 0)}
                    y2={toScreenY(pointPData.footY || 0)}
                    stroke="#10B981"
                    strokeWidth="2.2"
                    strokeDasharray="4,2"
                  />
                  <circle cx={toScreenX(pointPData.footX || 0)} cy={toScreenY(pointPData.footY || 0)} r="3.5" fill="#10B981" />
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
                r="7.5"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                style={{ cursor: 'grab', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
              <text
                x={labelPositions.pStyle.x}
                y={labelPositions.pStyle.y}
                textAnchor={labelPositions.pStyle.textAnchor}
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
              {conic.conicType === 'parabola' && t.proofParabola}
              {conic.conicType === 'ellipse' && t.proofEllipse}
              {conic.conicType === 'hyperbola' && t.proofHyperbola}
            </div>
            <div className="text-slate-600 flex items-center gap-2 font-mono text-xs">
              {conic.conicType === 'parabola' && (
                <>
                  <span>|PF| = <strong className="text-emerald-700 font-bold">{pointPData.dist1.toFixed(3)}</strong></span>
                  <span>=</span>
                  <span>|PD| = <strong className="text-emerald-700 font-bold">{pointPData.dist2?.toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">{t.alwaysHolds}</span>
                </>
              )}
              {conic.conicType === 'ellipse' && (
                <>
                  <span>d₁ + d₂ = <strong className="text-emerald-700 font-bold">{(pointPData.sum || 0).toFixed(3)}</strong></span>
                  <span>= 2a = <strong className="text-emerald-700 font-bold">{((conic.parameters.a || 0) * 2).toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">{t.equalsMajor}</span>
                </>
              )}
              {conic.conicType === 'hyperbola' && (
                <>
                  <span>|d₁ - d₂| = <strong className="text-emerald-700 font-bold">{(pointPData.diff || 0).toFixed(3)}</strong></span>
                  <span>= 2a = <strong className="text-emerald-700 font-bold">{((conic.parameters.a || 0) * 2).toFixed(3)}</strong></span>
                  <span className="text-emerald-600 font-sans font-bold">{t.equalsTransverse}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Orientation & Parameter Badge (Top-left inside SVG container) */}
        {parabolaDetails && (
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs text-[11px] font-semibold text-slate-700 flex items-center gap-2">
            <span className="flex items-center gap-1 text-sky-700">
              {parabolaDetails.direction === 'right' && <ArrowRight className="w-3.5 h-3.5" />}
              {parabolaDetails.direction === 'left' && <ArrowLeft className="w-3.5 h-3.5" />}
              {parabolaDetails.direction === 'up' && <ArrowUp className="w-3.5 h-3.5" />}
              {parabolaDetails.direction === 'down' && <ArrowDown className="w-3.5 h-3.5" />}
              <span>{t.opens}: {parabolaDetails.direction.toUpperCase()}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-purple-700">p = {parabolaDetails.p.toFixed(2).replace(/\.00$/, '')}</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700">p/2 = {parabolaDetails.halfP.toFixed(2).replace(/\.00$/, '')}</span>
          </div>
        )}
      </div>

      {/* Point P Slider & Direct Control */}
      {layers.proof && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-xs sm:text-sm print-hide">
          <span className="text-slate-600 font-medium whitespace-nowrap">
            {t.dragPointNotice}
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

      {/* Visual Legend Bar at Bottom */}
      <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            <span className="font-bold text-slate-800">{t.focusLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-600 inline-block"></span>
            <span className="font-bold text-slate-800">{t.directrixLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
            <span className="font-bold text-slate-800">{t.vertexLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-amber-500 inline-block"></span>
            <span className="font-bold text-slate-800">{t.latusLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-indigo-600 inline-block"></span>
            <span className="font-bold text-slate-800">{t.focalDist}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-emerald-500 inline-block"></span>
            <span className="font-bold text-slate-800">{t.layerProof}</span>
          </span>
        </div>
        <div className="text-slate-400">
          {t.textbookNotice}
        </div>
      </div>
    </div>
  );
};
