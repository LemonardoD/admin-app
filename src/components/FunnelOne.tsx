import type { FunnelData } from "../types/funnel";
import { useEffect, useRef } from "react";
import "./FunnelOne.css";

interface ConversionBreakdownFunnelProps {
  data: FunnelData[];
}

export default function ConversionBreakdownFunnel({ data }: ConversionBreakdownFunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxValue = Math.max(...data.map((d) => d.value));

  // Calculate drop-off for each step
  const stepsWithDropoff = data.map((step, index) => {
    const prevValue = index === 0 ? step.value : data[index - 1].value;
    const dropOff = prevValue - step.value;
    const dropOffPercent = prevValue > 0 ? ((dropOff / prevValue) * 100).toFixed(1) : "0";
    return { ...step, dropOff, dropOffPercent };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for retina displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    drawFunnel(ctx, data, maxValue, rect.width, rect.height);
  }, [data, maxValue]);

  return (
    <div className='conversion-breakdown'>
      <div className='conversion-chart'>
        {/* Canvas visualization */}
        <div className='conversion-area-container'>
          <canvas
            ref={canvasRef}
            className='conversion-canvas'
            style={{ width: "100%", height: "200px" }}
          />
        </div>

        {/* Labels and values */}
        <div className='conversion-labels'>
          {stepsWithDropoff.map((step) => (
            <div
              key={step.label}
              className='conversion-step'
            >
              <div className='step-header'>
                <span className='step-label'>{step.label}</span>
                <span className='step-value'>{step.value.toLocaleString()}</span>
              </div>
              {step.dropOff > 0 && (
                <div className='step-dropoff'>
                  <span className='dropoff-label'>Drop off</span>
                  <span className='dropoff-value'>
                    {step.dropOff.toLocaleString()} <span className='dropoff-percent'>({step.dropOffPercent}%)</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function drawTopPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], stepWidth: number, width: number, offset = 0) {
  const pointsOffset = points.map((p) => ({
    x: p.x,
    y: Math.max(0, p.y - offset)
  }));

  ctx.beginPath();
  ctx.moveTo(0, pointsOffset[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = pointsOffset[i];
    const p1 = pointsOffset[i + 1];

    const stepStart = i * stepWidth;
    const stepEnd = (i + 1) * stepWidth;

    // Draw curve from current level to next level
    const cp1x = stepStart + stepWidth * 0.65;
    const cp2x = stepEnd - stepWidth * 0.35;
    ctx.bezierCurveTo(cp1x, p0.y, cp2x, p1.y, stepEnd, p1.y);
  }

  // Last step is flat - no curve, just extend to the end
  ctx.lineTo(width, pointsOffset[points.length - 1].y);
}

function drawFunnel(ctx: CanvasRenderingContext2D, data: FunnelData[], maxValue: number, width: number, height: number) {
  const offsetY = 40;
  const chartHeight = height - offsetY;
  const stepWidth = width / data.length;

  ctx.clearRect(0, 0, width, height);

  const points = data.map((d, i) => ({
    x: i * stepWidth + stepWidth / 2,
    y: chartHeight - (d.value / maxValue) * chartHeight
  }));

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#00DAD0");
  gradient.addColorStop(1, "#0584A6");

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, points[0].y);
  ctx.translate(0, 20);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    const stepStart = i * stepWidth;
    const stepEnd = (i + 1) * stepWidth;

    // Draw curve from current level to next level
    const cp1x = stepStart + stepWidth * 0.65;
    const cp2x = stepEnd - stepWidth * 0.35;
    ctx.bezierCurveTo(cp1x, p0.y, cp2x, p1.y, stepEnd, p1.y);
  }

  // Last step is flat - extend to the end
  const lastPoint = points[points.length - 1];
  ctx.lineTo(width, lastPoint.y);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // 45 DEG HATCH LINES
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 10;
  patternCanvas.height = 10;
  const pctx = patternCanvas.getContext("2d");
  if (pctx) {
    pctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    pctx.lineWidth = 1;
    pctx.beginPath();
    pctx.moveTo(0, 10);
    pctx.lineTo(10, 0);
    pctx.stroke();
  }
  const pattern = ctx.createPattern(patternCanvas, "repeat");

  if (pattern) {
    ctx.lineTo(width, lastPoint.y);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = pattern;
    ctx.fill();
  }

  // Top curve
  drawTopPath(ctx, points, stepWidth, width);
  ctx.strokeStyle = "#E5FCFB";
  ctx.lineWidth = offsetY;
  ctx.stroke();

  // border
  drawTopPath(ctx, points, stepWidth, width, -offsetY / 2);
  ctx.strokeStyle = "#0584A6";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 1; i <= data.length - 1; i++) {
    const x = i * stepWidth;
    ctx.beginPath();
    ctx.strokeStyle = "#E6EBE9";
    ctx.lineWidth = 2;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}
