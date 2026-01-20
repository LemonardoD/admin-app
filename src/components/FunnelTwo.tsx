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
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

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

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const stepCount = processedSteps.length;
    if (stepCount === 0) return;

    const paddingLeft = 60;
    const paddingRight = 60;
    const paddingTop = 60;
    const chartHeight = 280;
    const barWidth = 80;
    const availableWidth = dimensions.width - paddingLeft - paddingRight;
    const stepWidth = availableWidth / stepCount;
    const baselineY = paddingTop + chartHeight;

    // bar positions and heights
    const bars: { x: number; y: number; width: number; height: number; centerX: number }[] = [];

    for (let i = 0; i < stepCount; i++) {
      const step = processedSteps[i];
      const centerX = paddingLeft + stepWidth * i + stepWidth / 2;
      const barHeight = (step.percent / 100) * chartHeight;
      const barX = centerX - barWidth / 2;
      const barY = baselineY - barHeight;

      bars.push({ x: barX, y: barY, width: barWidth, height: barHeight, centerX });
    }

    // Curved connections between bars
    if (bars.length > 1) {
      ctx.beginPath();

      // Start from bottom-left of first bar
      ctx.moveTo(bars[0].x, bars[0].y + bars[0].height);

      // Draw up along first bar to top-left
      ctx.lineTo(bars[0].x, bars[0].y);

      // Draw across tops
      for (let i = 0; i < bars.length - 1; i++) {
        const currentBar = bars[i];
        const nextBar = bars[i + 1];

        const startX = currentBar.x + currentBar.width;
        const startY = currentBar.y;
        const endX = nextBar.x;
        const endY = nextBar.y;

        const cp1x = startX + (endX - startX) * 0.4;
        const cp1y = startY;
        const cp2x = startX + (endX - startX) * 0.6;
        const cp2y = endY;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      }

      // Draw down along the last bar to bottom-right
      const lastBar = bars[bars.length - 1];
      ctx.lineTo(lastBar.x + lastBar.width, lastBar.y + lastBar.height);

      // Draw bottom edges of bars back to start
      for (let i = bars.length - 1; i > 0; i--) {
        const prevBar = bars[i - 1];
        // Bottom edge of current bar
        ctx.lineTo(prevBar.x + prevBar.width, prevBar.y + prevBar.height);
      }

      // Close path along bottom-left of first bar
      ctx.lineTo(bars[0].x, bars[0].y + bars[0].height);

      ctx.closePath();

      // Fill funnel
      ctx.fillStyle = "#E9E3FF";
      ctx.fill();
    }

    // horizontal baseline
    ctx.beginPath();
    ctx.moveTo(paddingLeft - 20, baselineY);
    ctx.lineTo(dimensions.width - paddingRight + 20, baselineY);
    ctx.strokeStyle = "#9F8DE3";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const radius = 12;

      ctx.beginPath();
      ctx.moveTo(bar.x, baselineY);
      ctx.lineTo(bar.x, bar.y + radius);
      ctx.quadraticCurveTo(bar.x, bar.y, bar.x + radius, bar.y);
      ctx.lineTo(bar.x + bar.width - radius, bar.y);
      ctx.quadraticCurveTo(bar.x + bar.width, bar.y, bar.x + bar.width, bar.y + radius);
      ctx.lineTo(bar.x + bar.width, baselineY);
      ctx.closePath();

      ctx.fillStyle = "#B5D1FC";
      ctx.fill();

      ctx.strokeStyle = "#9C92E9";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // percentage labels
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#374151";

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const step = processedSteps[i];
      const barText = step.percent === 100 ? formatNumber(step.value) : `${step.percent.toFixed(2)}%`;
      ctx.fillText(barText, bar.centerX, bar.y - 8);
    }
  }, [processedSteps, dimensions]);

  return (
    <div
      className='funnel-two-container'
      ref={containerRef}
    >
      <div className='funnel-two-canvas-wrapper'>
        <canvas
          ref={canvasRef}
          className='funnel-two-canvas'
          style={{ width: dimensions.width, height: dimensions.height }}
        />
      </div>

      {/* Step labels below chart */}
      <div
        className='funnel-two-labels'
        style={{ paddingLeft: 60, paddingRight: 60 }}
      >
        {processedSteps.map((step, index) => (
          <div
            key={step.label}
            className='funnel-two-step-label'
          >
            <div className='funnel-two-step-name'>{step.label}</div>

            <div className='funnel-two-step-stats'>
              <div className='funnel-two-stat-row funnel-two-stat-completed'>
                <span className='funnel-two-stat-arrow'>→</span>
                <span className='funnel-two-stat-value'>{step.value.toLocaleString()} Users</span>
                <span className='funnel-two-stat-percent'>({step.completedPercent}%)</span>
              </div>
              <div className='funnel-two-stat-description'>{index === 0 ? "Total Active Users" : "Completed this Step"}</div>
            </div>

            {index > 0 && (
              <div className='funnel-two-step-stats'>
                <div className='funnel-two-stat-row funnel-two-stat-dropped'>
                  <span className='funnel-two-stat-arrow'>↘</span>
                  <span className='funnel-two-stat-value'>{step.droppedUsers.toLocaleString()} Users</span>
                  <span className='funnel-two-stat-percent'>({step.droppedPercent}%)</span>
                </div>
                <div className='funnel-two-stat-description'>Dropped out</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
