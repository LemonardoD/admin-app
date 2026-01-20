import ConversionBreakdownFunnel from './components/ConversionBreakdownFunnel'
import VerticalBarFunnel from './components/VerticalBarFunnel'
import ProductFunnel from './components/ProductFunnel'
import type { FunnelData } from './types/funnel'
import './App.css'

// Shared funnel data - 3 steps with label and value
const funnelData: FunnelData[] = [
  { label: 'Visit Website', value: 150928 },
  { label: 'Add to Cart', value: 85420 },
  { label: 'Purchase', value: 12350 }
];

function App() {
  return (
    <div className="app">
      <main className="app-main-funnels">
        {/* Funnel 1: Conversion Breakdown (Teal area chart) */}
        <section className="funnel-section">
          <ConversionBreakdownFunnel data={funnelData} />
        </section>
        
        {/* Funnel 2: Vertical Bar Funnel (Purple bars with gradient) */}
        <section className="funnel-section">
          <VerticalBarFunnel data={funnelData} />
        </section>
        
        {/* Funnel 3: Product Funnel (Purple column chart) */}
        <section className="funnel-section">
          <ProductFunnel data={funnelData} />
        </section>
      </main>
    </div>
  )
}

export default App
