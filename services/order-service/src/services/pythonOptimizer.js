import fetch from "node-fetch";

const DEFAULT_URL = "http://localhost:8001/optimize";

export const optimizeRouteWithPython = async ({ depot, locations, url = DEFAULT_URL }) => {
  const payload = {
    depot,
    locations,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Python optimizer error: ${response.status} ${text}`);
  }

  return response.json();
};
