import { useState } from "react";
import FunnelTwo from "./components/FunnelTwo";
import { useFunnelData } from "./hooks/useFunnelData";

const intervals = ["7d", "14d", "30d", "90d", "180d"];

function App() {
  const [selectedInterval, setSelectedInterval] = useState("90d");
  const { data, isLoading } = useFunnelData(selectedInterval);

  if (isLoading) {
    return (
      <main className='app-main-funnels'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900' />
        </div>
      </main>
    );
  }

  return (
    <main className='app-main-funnels'>
      <div className='flex gap-2 justify-center mb-8'>
        {intervals.map((interval) => (
          <button
            key={interval}
            type='button'
            onClick={() => setSelectedInterval(interval)}
            className={`px-4 py-2 rounded ${
              selectedInterval === interval ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      <section className='funnel-section'>
        <FunnelTwo data={[...data, ...data, ...data] || []} />
      </section>
    </main>
  );
}

export default App;
