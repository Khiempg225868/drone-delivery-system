export const nearestNeighbor = (depot, locations) => {
  if (locations.length === 0) return [];

  const visited = new Set();
  const route = [];
  let current = depot;

  while (visited.size < locations.length) {
    let nearest = null;
    let nearestDist = Infinity;
    let nearestIdx = -1;

    for (let i = 0; i < locations.length; i++) {
      if (visited.has(i)) continue;

      const dist = calculateDistance(current, locations[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = locations[i];
        nearestIdx = i;
      }
    }

    if (nearestIdx !== -1) {
      visited.add(nearestIdx);
      route.push(nearestIdx);
      current = nearest;
    }
  }

  return route;
};

export const calculateDistance = (point1, point2) => {
  const R = 6371;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const twoOpt = (depot, locations, route) => {
  let improved = true;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(depot, locations, bestRoute);

  while (improved) {
    improved = false;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let j = i + 2; j < bestRoute.length; j++) {
        const newRoute = twoOptSwap(bestRoute, i, j);
        const newDistance = calculateRouteDistance(depot, locations, newRoute);

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return bestRoute;
};

const twoOptSwap = (route, i, j) => {
  const newRoute = route.slice(0, i);
  newRoute.push(...route.slice(i, j + 1).reverse());
  newRoute.push(...route.slice(j + 1));
  return newRoute;
};

export const calculateRouteDistance = (depot, locations, route) => {
  let totalDistance = 0;
  let current = depot;

  for (const idx of route) {
    totalDistance += calculateDistance(current, locations[idx]);
    current = locations[idx];
  }

  totalDistance += calculateDistance(current, depot);
  return totalDistance;
};
