import { useEffect, useRef } from "react";
import type { FunnelData } from "../types/funnel";

interface FunnelThreeProps {
  data: FunnelData[];
}

// Colors extracted from design
const COLORS = {
  barFill: "#7C6BFF", // Purple bar color
  barFillLight: "rgba(139, 107, 255, 0.15)", // Light purple background bar
  gridLine: "#E5E7EB",
  gridLineDashed: "#D1D5DB",
  textGray: "#9CA3AF",
  textDark: "#1F2937",
  textMedium: "#6B7280",
  white: "#FFFFFF",
  tooltipBorder: "#E5E7EB",
  legendDot: "#7C6BFF"
};

const FONTS = {
  yAxis: "12px Inter, -apple-system, sans-serif",
  tooltip: "600 14px 'SF Mono', 'Monaco', 'Consolas', monospace",
  tooltipValue: "12px 'SF Mono', 'Monaco', 'Consolas', monospace",
  stepNumber: "500 14px Inter, -apple-system, sans-serif",
  stepName: "600 14px Inter, -apple-system, sans-serif",
  legend: "14px Inter, -apple-system, sans-serif",
  legendValue: "600 14px Inter, -apple-system, sans-serif"
};

export default function FunnelThree({ data }: FunnelThreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxValue = data[0]?.value || 1;

  // Calculate percentages and step numbers
  const stepsWithPercent = data.map((step, index) => {
    const percent = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(2) : "0";
    return { ...step, percent: Number.parseFloat(percent), step: index + 1 };
  });

  // Calculate overall conversion (first to last)
  const overallConversion = maxValue > 0 ? ((data[data.length - 1]?.value / maxValue) * 100).toFixed(2) : "0";

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;

    // Set canvas dimensions
    const containerWidth = container.clientWidth;
    const canvasWidth = containerWidth;
    const canvasHeight = 400;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);

    // Layout constants
    const paddingLeft = 50;
    const paddingRight = 40;
    const paddingTop = 60;
    const chartHeight = 260;

    const chartWidth = canvasWidth - paddingLeft - paddingRight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw Y-axis labels
    drawYAxisLabels(ctx, paddingLeft, paddingTop, chartHeight);
    // Draw grid lines
    drawGridLines(ctx, paddingLeft, paddingTop, chartHeight, chartWidth);
    // Draw bars
    drawBars(ctx, stepsWithPercent, paddingLeft, paddingTop, chartHeight, chartWidth, maxValue);
  }, [stepsWithPercent, maxValue, overallConversion]);

  return (
    <div
      ref={containerRef}
      className='product-funnel'
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%" }}
      />
    </div>
  );
}

function drawYAxisLabels(ctx: CanvasRenderingContext2D, paddingLeft: number, paddingTop: number, chartHeight: number) {
  const labels = ["100%", "75%", "50%", "25%", "0%"];

  ctx.save();
  ctx.font = FONTS.yAxis;
  ctx.fillStyle = COLORS.textGray;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  labels.forEach((label, index) => {
    const y = paddingTop + (index * chartHeight) / (labels.length - 1);
    ctx.fillText(label, paddingLeft - 12, y);
  });

  ctx.restore();
}

function drawGridLines(ctx: CanvasRenderingContext2D, paddingLeft: number, paddingTop: number, chartHeight: number, chartWidth: number) {
  const lineCount = 5;

  ctx.save();

  for (let i = 0; i < lineCount; i++) {
    const y = paddingTop + (i * chartHeight) / (lineCount - 1);

    if (i === lineCount - 1) {
      // Dashed line at bottom (0%)
      ctx.strokeStyle = COLORS.gridLineDashed;
      ctx.setLineDash([4, 4]);
    } else {
      ctx.strokeStyle = COLORS.gridLine;
      ctx.setLineDash([]);
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, Math.round(y) + 0.5);
    ctx.lineTo(paddingLeft + chartWidth, Math.round(y) + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  steps: Array<{ label: string; value: number; percent: number; step: number }>,
  paddingLeft: number,
  paddingTop: number,
  chartHeight: number,
  chartWidth: number,
  maxValue: number
) {
  const barCount = steps.length;
  const barAreaWidth = chartWidth / barCount;
  const barWidth = Math.min(180, barAreaWidth * 0.65);

  steps.forEach((step, index) => {
    const barCenterX = paddingLeft + barAreaWidth * index + barAreaWidth / 2;
    const barX = barCenterX - barWidth / 2;
    const barHeight = (step.value / maxValue) * chartHeight;
    const barY = paddingTop + chartHeight - barHeight;
    const radius = 6;

    if (index > 0) {
      const previousStep = steps[index - 1];
      const previousBarHeight = (previousStep.value / maxValue) * chartHeight;
      const previousBarY = paddingTop + chartHeight - previousBarHeight;
      ctx.save();
      ctx.fillStyle = COLORS.barFillLight;
      ctx.beginPath();

      ctx.moveTo(barX + radius, previousBarY);
      ctx.lineTo(barX + barWidth - radius, previousBarY);
      ctx.quadraticCurveTo(barX + barWidth, previousBarY, barX + barWidth, previousBarY + radius);
      ctx.lineTo(barX + barWidth, previousBarY + previousBarHeight);
      ctx.lineTo(barX, previousBarY + previousBarHeight);
      ctx.lineTo(barX, previousBarY + radius);
      ctx.quadraticCurveTo(barX, previousBarY, barX + radius, previousBarY);
      ctx.fill();
      ctx.restore();
    }

    const mainBarRadius = index === 0 ? radius : 0;
    // Draw actual value bar
    ctx.save();
    ctx.fillStyle = COLORS.barFill;
    ctx.beginPath();
    ctx.moveTo(barX + mainBarRadius, barY);
    ctx.lineTo(barX + barWidth - mainBarRadius, barY);
    ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + mainBarRadius);
    ctx.lineTo(barX + barWidth, barY + barHeight);
    ctx.lineTo(barX, barY + barHeight);
    ctx.lineTo(barX, barY + mainBarRadius);
    ctx.quadraticCurveTo(barX, barY, barX + mainBarRadius, barY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw tooltip
    drawTooltip(ctx, barCenterX, barY, step.percent, step.value);
  });
}

function drawTooltip(ctx: CanvasRenderingContext2D, centerX: number, barY: number, percent: number, value: number) {
  const paddingX = 12;
  const paddingY = 8;
  const lineHeight = 18;
  const tooltipHeight = paddingY * 2 + lineHeight * 1.5;

  const percentText = `${percent.toFixed(2)}%`;
  const valueText = formatValue(value);

  // Measure tooltip width
  ctx.font = FONTS.tooltip;
  const percentWidth = ctx.measureText(percentText).width;
  ctx.font = FONTS.tooltipValue;
  const valueWidth = ctx.measureText(valueText).width;
  const tooltipWidth = Math.max(percentWidth, valueWidth) + paddingX * 2;

  const tooltipX = centerX - tooltipWidth / 2;
  const tooltipY = barY - tooltipHeight / 2;

  ctx.save();

  const radius = 8;
  // Draw tooltip background with shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(tooltipX + radius, tooltipY);
  ctx.lineTo(tooltipX + tooltipWidth - radius, tooltipY);
  ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + radius);
  ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - radius);
  ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight, tooltipX + tooltipWidth - radius, tooltipY + tooltipHeight);
  ctx.lineTo(tooltipX + radius, tooltipY + tooltipHeight);
  ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - radius);
  ctx.lineTo(tooltipX, tooltipY + radius);
  ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + radius, tooltipY);
  ctx.fill();

  // Draw tooltip border
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = COLORS.tooltipBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();

  ctx.moveTo(tooltipX + radius, tooltipY);
  ctx.lineTo(tooltipX + tooltipWidth - radius, tooltipY);
  ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + radius);
  ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - radius);
  ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight, tooltipX + tooltipWidth - radius, tooltipY + tooltipHeight);
  ctx.lineTo(tooltipX + radius, tooltipY + tooltipHeight);
  ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - radius);
  ctx.lineTo(tooltipX, tooltipY + radius);
  ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + radius, tooltipY);
  ctx.closePath();
  ctx.stroke();

  // Draw arrow
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(centerX, tooltipY + tooltipHeight);
  ctx.lineTo(centerX, tooltipY + tooltipHeight);
  ctx.lineTo(centerX, tooltipY + tooltipHeight);
  ctx.closePath();
  ctx.fill();

  // Arrow border
  ctx.strokeStyle = COLORS.tooltipBorder;
  ctx.beginPath();
  ctx.moveTo(centerX - 0.5, tooltipY + tooltipHeight);
  ctx.lineTo(centerX, tooltipY + tooltipHeight);
  ctx.lineTo(centerX + 0.5, tooltipY + tooltipHeight);
  ctx.stroke();

  // Cover the arrow top line
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(centerX + 1, tooltipY + tooltipHeight - 1, 0, 2);

  // Draw percentage text
  ctx.fillStyle = COLORS.textDark;
  ctx.font = FONTS.tooltip;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(percentText, centerX, tooltipY + paddingY);

  // Draw value text
  ctx.fillStyle = COLORS.textMedium;
  ctx.font = FONTS.tooltipValue;
  ctx.fillText(valueText, centerX, tooltipY + paddingY + lineHeight);

  ctx.restore();
}

// Format value with K suffix for thousands
function formatValue(value: number): string {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(2);
    // Remove trailing zeros after decimal
    const cleaned = formatted.replace(/\.?0+$/, "");
    return `${cleaned}K`;
  }
  return value.toLocaleString();
}
