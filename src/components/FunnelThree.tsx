import type { FunnelData } from "../types/funnel";
import "./FunnelThree.css";

interface FunnelThreeProps {
  data: FunnelData[];
}

export default function FunnelThree({ data }: FunnelThreeProps) {
  const maxValue = data[0]?.value || 1;

  // Calculate percentages and step numbers
  const stepsWithPercent = data.map((step, index) => {
    const percent = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(2) : "0";
    return { ...step, percent: Number.parseFloat(percent), step: index + 1 };
  });

  // Calculate overall conversion (first to last)
  const overallConversion = maxValue > 0 ? ((data[data.length - 1]?.value / maxValue) * 100).toFixed(2) : "0";

  return (
    <div className='product-funnel'>
      {/* Header */}
      <div className='pf-header'>
        <div className='pf-legend'>
          <span className='pf-legend-dot' />
          <span className='pf-legend-text'>Overall</span>
          <span className='pf-legend-value'>{overallConversion}%</span>
        </div>
      </div>

      {/* Y-axis and chart */}
      <div className='pf-chart-container'>
        {/* Y-axis labels */}
        <div className='pf-y-axis'>
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className='pf-chart'>
          {/* Horizontal grid lines */}
          <div className='pf-grid-lines'>
            <div className='pf-grid-line' />
            <div className='pf-grid-line' />
            <div className='pf-grid-line' />
            <div className='pf-grid-line' />
            <div className='pf-grid-line pf-grid-line-dashed' />
          </div>

          {/* Bars */}
          <div className='pf-bars'>
            {stepsWithPercent.map((step) => {
              const heightPercent = (step.value / maxValue) * 100;
              return (
                <div
                  key={step.label}
                  className='pf-bar-column'
                >
                  <div className='pf-bar-wrapper'>
                    {/* Full height faded bar */}
                    <div className='pf-bar-background' />
                    {/* Actual value bar */}
                    <div
                      className='pf-bar'
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className='pf-bar-tooltip'>
                        <span className='pf-tooltip-percent'>{step.percent}%</span>
                        <span className='pf-tooltip-value'>{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className='pf-bar-label'>
                    <span className='pf-step-number'>{step.step}</span>
                    <span className='pf-step-name'>{step.label}</span>
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
