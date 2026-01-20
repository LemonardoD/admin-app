import FunnelOne from "./components/FunnelOne";
import FunnelThree from "./components/FunnelThree";
import FunnelTwo from "./components/FunnelTwo";
import type { FunnelData } from "./types/funnel";

const funnelData: FunnelData[] = [
  { label: "Visit Website", value: 150928 },
  { label: "Add to Cart", value: 85420 },
  { label: "Purchase", value: 12350 }
];

function App() {
  return (
    <main className='app-main-funnels'>
      <section className='funnel-section'>
        <FunnelOne data={funnelData} />
      </section>

      <section className='funnel-section'>
        <FunnelTwo data={funnelData} />
      </section>

      <section className='funnel-section'>
        <FunnelThree data={funnelData} />
      </section>
    </main>
  );
}

export default App;
