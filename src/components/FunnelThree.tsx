import type { FunnelData } from "../types/funnel";
import "./FunnelThree.css";

interface VerticalBarFunnelProps {
  data: FunnelData[];
}

export default function VerticalBarFunnel({ data }: VerticalBarFunnelProps) {
  const maxValue = data[0]?.value || 1;

  // Calculate conversion percentages
  const stepsWithPercent = data.map((step) => {
    const percent = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(2) : "0";
    return { ...step, conversionPercent: Number.parseFloat(percent) };
  });

  return (
    <div className='vertical-bar-funnel'>
      {/* Funnel Chart */}
      <div className='vbf-chart'>
        <div className='vbf-bars-container'>
          {/* Background gradient area */}
          <svg
            className='vbf-background-area'
            viewBox='0 0 800 400'
            preserveAspectRatio='none'
          >
            <title>Funnel background gradient</title>
            <defs>
              <linearGradient
                id='purpleGradient'
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <stop
                  offset='0%'
                  stopColor='#A78BFA'
                  stopOpacity='0.4'
                />
                <stop
                  offset='100%'
                  stopColor='#A78BFA'
                  stopOpacity='0.1'
                />
              </linearGradient>
            </defs>
            <path
              d={generateFunnelPath(data, maxValue)}
              fill='url(#purpleGradient)'
            />
          </svg>

          {/* Bars */}
          <div className='vbf-bars'>
            {stepsWithPercent.map((step) => {
              const heightPercent = (step.value / maxValue) * 100;
              return (
                <div
                  key={step.label}
                  className='vbf-bar-wrapper'
                >
                  <div className='vbf-bar-value'>{formatNumber(step.value)}</div>
                  <div className='vbf-bar-container'>
                    <div
                      className='vbf-bar'
                      style={{ height: `${heightPercent}%` }}
                    >
                      <span className='vbf-bar-percent'>{step.conversionPercent}%</span>
                    </div>
                  </div>
                  <div className='vbf-bar-label'>{step.label}</div>
                  <div className='vbf-bar-stats'>
                    <span className='vbf-arrow'>-&gt;</span>
                    <span>{step.value.toLocaleString()} Users</span>
                    <span className='vbf-conversion-rate'>({step.conversionPercent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function generateFunnelPath(data: FunnelData[], maxValue: number): string {
  const width = 800;
  const height = 400;
  const stepWidth = width / data.length;
  const barWidth = 100;

  // Calculate points for the gradient background
  const topPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < data.length; i++) {
    const x = i * stepWidth + stepWidth / 2;
    const barHeight = (data[i].value / maxValue) * height * 0.7;
    const barTop = height - barHeight - 60;

    topPoints.push({ x: x - barWidth / 2, y: barTop });
    topPoints.push({ x: x + barWidth / 2, y: barTop });
  }

  // Create smooth path
  let path = `M ${topPoints[0].x} ${topPoints[0].y}`;

  // Top edge with curves
  for (let i = 0; i < topPoints.length - 1; i += 2) {
    if (i + 2 < topPoints.length) {
      const current = topPoints[i + 1];
      const next = topPoints[i + 2];
      const midX = (current.x + next.x) / 2;
      path += ` L ${current.x} ${current.y}`;
      path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    } else {
      path += ` L ${topPoints[i + 1].x} ${topPoints[i + 1].y}`;
    }
  }

  // Right edge down
  path += ` L ${topPoints[topPoints.length - 1].x} ${height - 60}`;

  // Bottom edge
  path += ` L ${topPoints[0].x} ${height - 60}`;

  path += " Z";

  return path;
}
