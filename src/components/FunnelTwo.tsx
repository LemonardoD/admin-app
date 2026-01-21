import { useEffect, useRef, useState } from "react";
import type { FunnelData } from "../types/funnel";
import "./FunnelTwo.css";

interface FunnelTwoProps {
  data: FunnelData[];
}

interface ProcessedStep {
  label: string;
  value: number;
  percent: number;
  completedPercent: string;
  droppedUsers: number;
  droppedPercent: string;
}

// Format number with k suffix
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2).replace(/\.?0+$/, "")}k`;
  }
  return num.toString();
};

export default function FunnelTwo({ data }: FunnelTwoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    type: "",
    stepIndex: -1,
    stepData: null as ProcessedStep | null
  });

  const maxValue = data[0]?.value || 1;

  // Process data with conversion rates
  const processedSteps: ProcessedStep[] = data.map((step, index) => {
    const percent = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
    const prevValue = index > 0 ? data[index - 1].value : step.value;
    const completedPercent = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(2) : "100.00";
    const droppedUsers = index > 0 ? prevValue - step.value : 0;
    const droppedPercent = prevValue > 0 ? ((droppedUsers / prevValue) * 100).toFixed(2) : "0.00";

    return {
      label: step.label,
      value: step.value,
      percent,
      completedPercent,
      droppedUsers,
      droppedPercent
    };
  });

  // Fixed dimensions for scrollable layout
  const stepCount = processedSteps.length;
  const fixedStepWidth = 180;
  const paddingY = 90;
  const width = stepCount * fixedStepWidth + paddingY;
  const height = 400;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // reset transform to avoid stacking scales
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const stepCount = processedSteps.length;
    if (!stepCount) return;

    const paddingTop = 60;
    const chartHeight = 280;

    const availableWidth = width - paddingY;
    const stepWidth = availableWidth / stepCount;

    const barWidth = fixedStepWidth / 2.5;
    const baselineY = paddingTop + chartHeight;

    const bars: {
      x: number;
      y: number;
      width: number;
      height: number;
      centerX: number;
      radius: number;
    }[] = [];

    for (let i = 0; i < stepCount; i++) {
      const step = processedSteps[i];
      const centerX = paddingY / 2 + stepWidth * i + stepWidth / 2;
      const height = (step.percent / 100) * chartHeight;
      const x = centerX - barWidth / 2;
      const y = baselineY - height;
      const radius = Math.min(8, height / 2);

      bars.push({ x, y, width: barWidth, height, centerX, radius });
    }

    /* ================= FUNNEL SHAPE ================= */

    if (bars.length > 1) {
      ctx.beginPath();

      // bottom-left
      ctx.moveTo(bars[0].x, baselineY);

      // up first bar
      ctx.lineTo(bars[0].x, bars[0].y + bars[0].radius);
      ctx.quadraticCurveTo(bars[0].x, bars[0].y, bars[0].x + bars[0].radius, bars[0].y);

      // top connections
      for (let i = 0; i < bars.length - 1; i++) {
        const a = bars[i];
        const b = bars[i + 1];

        const startX = a.x + a.width - a.radius;
        const endX = b.x + b.radius;
        const dx = endX - startX;
        const cp = dx * 0.5;

        ctx.lineTo(startX, a.y);

        ctx.bezierCurveTo(startX + cp, a.y, endX - cp, b.y, endX, b.y);
      }

      // top-right corner of last bar
      const last = bars[bars.length - 1];
      ctx.lineTo(last.x + last.width - last.radius, last.y);
      ctx.quadraticCurveTo(last.x + last.width, last.y, last.x + last.width, last.y + last.radius);

      // down to baseline
      ctx.lineTo(last.x + last.width, baselineY);

      // back along bottom
      ctx.lineTo(bars[0].x, baselineY);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, paddingTop, 0, baselineY);
      gradient.addColorStop(0, "#EFEAFF");
      gradient.addColorStop(1, "#E2DAFF");

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // --- BASELINE ---

    ctx.beginPath();
    ctx.moveTo(paddingY / 2, baselineY);
    ctx.lineTo(width - paddingY / 2, baselineY);
    ctx.strokeStyle = "#9F8DE3";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- BARS ---

    for (const bar of bars) {
      ctx.beginPath();
      ctx.moveTo(bar.x, baselineY);
      ctx.lineTo(bar.x, bar.y + bar.radius);
      ctx.quadraticCurveTo(bar.x, bar.y, bar.x + bar.radius, bar.y);
      ctx.lineTo(bar.x + bar.width - bar.radius, bar.y);
      ctx.quadraticCurveTo(bar.x + bar.width, bar.y, bar.x + bar.width, bar.y + bar.radius);
      ctx.lineTo(bar.x + bar.width, baselineY);
      ctx.closePath();

      ctx.fillStyle = "#B5D1FC";
      ctx.fill();

      ctx.strokeStyle = "#9C92E9";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // --- LABELS ---

    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#374151";

    bars.forEach((bar, i) => {
      const step = processedSteps[i];
      const text = step.percent === 100 ? formatNumber(step.value) : `${step.percent.toFixed(2)}%`;

      ctx.fillText(text, bar.centerX, bar.y - 4);
    });
  }, [processedSteps, width]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const stepCount = processedSteps.length;
    if (!stepCount) return;

    const paddingTop = 60;
    const chartHeight = 280;
    const baselineY = paddingTop + chartHeight;
    const availableWidth = width - paddingY;
    const stepWidth = availableWidth / stepCount;
    const barWidth = fixedStepWidth / 2.5;

    // Check if hovering over a bar or label area
    let foundBar = false;
    for (let i = 0; i < stepCount; i++) {
      const centerX = paddingY / 2 + stepWidth * i + stepWidth / 2;
      const step = processedSteps[i];
      const barHeight = (step.percent / 100) * chartHeight + 25;
      const barX = centerX - barWidth / 2;
      const barY = baselineY - barHeight;

      // Check if hovering over bar
      if (canvasX >= barX && canvasX <= barX + barWidth && canvasY >= barY && canvasY <= baselineY) {
        setHoveredBar(i);
        setHoveredConnection(null);
        // Position tooltip at top of bar in canvas coordinates
        const tooltipCanvasX = centerX;
        // Convert to screen coordinates
        const screenX = rect.left + tooltipCanvasX / scaleX;
        const screenY = rect.top + barY / scaleY;
        setTooltipPosition({
          x: screenX,
          y: screenY,
          type: "bar",
          stepIndex: i,
          stepData: step
        });
        foundBar = true;
        break;
      }
    }

    // Check if hovering over connection area
    if (!foundBar && stepCount > 1) {
      for (let i = 0; i < stepCount - 1; i++) {
        const centerX1 = paddingY / 2 + stepWidth * i + stepWidth / 2;
        const centerX2 = paddingY / 2 + stepWidth * (i + 1) + stepWidth / 2;
        const step1 = processedSteps[i];
        const step2 = processedSteps[i + 1];
        const height1 = (step1.percent / 100) * chartHeight;
        const height2 = (step2.percent / 100) * chartHeight;
        const y1 = baselineY - height1;
        const y2 = baselineY - height2;

        // Simple rectangular hit detection for connection area
        const connectionX = centerX1 + barWidth / 2;
        const connectionWidth = centerX2 - centerX1 - barWidth;
        const connectionTopY = Math.min(y1, y2);
        const connectionHeight = Math.abs(y2 - y1) + 20;

        if (
          canvasX >= connectionX &&
          canvasX <= connectionX + connectionWidth &&
          canvasY >= connectionTopY &&
          canvasY <= connectionTopY + connectionHeight
        ) {
          setHoveredConnection(i);
          setHoveredBar(null);
          // Position tooltip at baseline center between bars
          const tooltipCanvasX = (centerX1 + centerX2) / 2;
          const tooltipCanvasY = baselineY + 10;
          // Convert to screen coordinates
          const screenX = rect.left + tooltipCanvasX / scaleX;
          const screenY = rect.top + tooltipCanvasY / scaleY;
          setTooltipPosition({
            x: screenX,
            y: screenY,
            type: "connection",
            stepIndex: i,
            stepData: step2
          });
          foundBar = true;
          break;
        }
      }
    }

    if (!foundBar) {
      setHoveredBar(null);
      setHoveredConnection(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    setHoveredConnection(null);
  };

  return (
    <div
      className='bg-white rounded-2xl p-6 shadow-sm w-full overflow-x-auto'
      ref={containerRef}
    >
      <div className='w-full relative'>
        <canvas
          ref={canvasRef}
          className='block cursor-crosshair'
          style={{ width, height }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {(hoveredBar !== null || hoveredConnection !== null) && (
          <div
            className='fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg p-2 shadow-lg -translate-x-1/2 -translate-y-full'
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }}
          >
            {tooltipPosition.type === "bar" && tooltipPosition.stepData && (
              <div className='flex flex-col items-center gap-0.5 text-center text-xs'>
                <div className='flex items-center gap-0.5 font-medium text-green-500'>
                  <span className='text-gray-900'>{tooltipPosition.stepData.value}</span>
                  <span>→ ({tooltipPosition.stepData.completedPercent}%)</span>
                </div>
                <div className='text-gray-500'>{tooltipPosition.stepIndex === 0 ? "Total Active Users" : "Completed this Step"}</div>
              </div>
            )}
            {tooltipPosition.type === "connection" && tooltipPosition.stepData && (
              <div className='flex flex-col items-center gap-0.5 text-center text-xs'>
                <div className='flex items-center gap-0.5 text-red-500 font-medium'>
                  <span className='text-gray-900'>{tooltipPosition.stepData.droppedUsers}</span>
                  <span>↘ ({tooltipPosition.stepData.droppedPercent}%)</span>
                </div>
                <div className='text-gray-500'>Dropped out</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step labels below chart */}
      <div className='flex justify-around mt-4 px-15'>
        {processedSteps.map((step) => (
          <span
            key={step.label}
            className='text-sm font-semibold text-gray-800'
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
