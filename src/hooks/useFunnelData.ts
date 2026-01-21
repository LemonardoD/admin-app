import { useState, useEffect } from "react";
import { fetchFunnelData } from "../api/funnel";
import type { FunnelData } from "../types/funnel";

export const useFunnelData = (interval?: string) => {
  const [data, setData] = useState<FunnelData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchFunnelData(interval);

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [interval]);

  return { data, isLoading, error };
};
