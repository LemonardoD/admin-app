export const fetchFunnelData = async (interval = "90d") => {
  const response = await fetch(`http://localhost:3000/analytics/funnel?interval=${interval}&siteId=onedollarstats.com`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization:
        "Bareer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxODNhMDI3NS01ZjBkLTQ1YjEtOWY3Zi00MWIzYTJhYzkwNDciLCJleHAiOjE3OTg4MTQzNjA1ODR9.5rLHsNBYntkp83R7wLdUKK9Tjj8hZmSo3vCdMrxv83Y"
    },
    body: JSON.stringify({
      steps: ["/", "/analytics", "/subscription"]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch funnel data: ${response.statusText}`);
  }

  const data = await response.json();

  const a = Object.entries(data);

  // Transform API response to match our FunnelData interface
  return a
    .map((step: [string, unknown], index) => ({
      label: `Step ${index + 1}`,
      value: Number(step[1])
    }))
    .filter((item) => item.value > 0); // Filter out items with zero value
};
