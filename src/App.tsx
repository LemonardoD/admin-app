import FunnelOne from "./components/FunnelOne";
import VerticalBarFunnel from "./components/VerticalBarFunnel";
import FunnelTwo from "./components/FunnelTwo";
import type { FunnelData } from "./types/funnel";
import "./App.css";

// Shared funnel data - 3 steps with label and value
const funnelData: FunnelData[] = [
  { label: "Visit Website", value: 150928 },
  { label: "Add to Cart", value: 85420 },
  { label: "Purchase", value: 12350 }
];

function App() {
  return (
    <div className='app'>
      <main className='app-main-funnels'>
        <section className='funnel-section'>
          <FunnelOne data={funnelData} />
        </section>

        {/* Funnel 2: Vertical Bar Funnel (Purple bars with gradient) */}
        <section className='funnel-section'>
          <VerticalBarFunnel data={funnelData} />
        </section>

        {/* Funnel 3: Product Funnel (Purple column chart) */}
        <section className='funnel-section'>
          <FunnelTwo data={funnelData} />
        </section>
      </main>
    </div>
  );
}

export default App;
