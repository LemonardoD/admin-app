import type { FunnelData } from '../types/funnel';
import './ConversionBreakdownFunnel.css';

interface ConversionBreakdownFunnelProps {
  data: FunnelData[];
}

export default function ConversionBreakdownFunnel({
  data
}: ConversionBreakdownFunnelProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Calculate drop-off for each step
  const stepsWithDropoff = data.map((step, index) => {
    const prevValue = index === 0 ? step.value : data[index - 1].value;
    const dropOff = prevValue - step.value;
    const dropOffPercent = prevValue > 0 ? ((dropOff / prevValue) * 100).toFixed(1) : '0';
    return { ...step, dropOff, dropOffPercent };
  });
  
  return (
    <div className="conversion-breakdown">
      <div className="conversion-chart">
        {/* Area visualization */}
        <div className="conversion-area-container">
          <svg viewBox="0 0 800 200" className="conversion-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5BCBCB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#5BCBCB" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            <title>Conversion funnel area chart</title>
            
            {/* Create smooth area path */}
            <path
              d={generateAreaPath(data, maxValue)}
              fill="url(#areaGradient)"
              stroke="#3DBDBD"
              strokeWidth="2"
            />
            
            {/* Vertical divider lines */}
            {data.map((step, index) => {
              if (index === 0) return null;
              const x = (index / data.length) * 800;
              return (
                <line
                  key={step.label}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="200"
                  stroke="#E8F4F4"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </svg>
        </div>
        
        {/* Labels and values */}
        <div className="conversion-labels">
          {stepsWithDropoff.map((step) => (
            <div key={step.label} className="conversion-step">
              <div className="step-header">
                <span className="step-label">{step.label}</span>
                <span className="step-value">{step.value.toLocaleString()}</span>
              </div>
              <div className="step-dropoff">
                <span className="dropoff-label">Drop off</span>
                <span className="dropoff-value">
                  {step.dropOff.toLocaleString()} <span className="dropoff-percent">({step.dropOffPercent}%)</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateAreaPath(data: FunnelData[], maxValue: number): string {
  const width = 800;
  const height = 200;
  const stepWidth = width / data.length;
  
  // Calculate heights based on values
  const points = data.map((step, index) => {
    const x = index * stepWidth + stepWidth / 2;
    const y = height - (step.value / maxValue) * height * 0.8 - 20;
    return { x, y };
  });
  
  // Start path from bottom left
  let path = `M 0 ${height}`;
  
  // Line to first point's x at bottom
  path += ` L 0 ${points[0].y}`;
  
  // Create smooth curves between points
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      path += ` L ${points[i].x} ${points[i].y}`;
    } else {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const midX = (prevPoint.x + currentPoint.x) / 2;
      path += ` C ${midX} ${prevPoint.y}, ${midX} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }
  }
  
  // Complete the path
  path += ` L ${width} ${points[points.length - 1].y}`;
  path += ` L ${width} ${height}`;
  path += ' Z';
  
  return path;
}
