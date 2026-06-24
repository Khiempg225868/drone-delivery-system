import json
import time
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Request
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel

from clustered_tsp import Point, clustered_tsp, calculate_route_distance


class DepotPayload(BaseModel):
    lat: float
    lng: float


class LocationPayload(BaseModel):
    lat: float
    lng: float
    orderId: Optional[str] = None
    houseId: Optional[str] = None


class OptimizeRequest(BaseModel):
    depot: DepotPayload
    locations: List[LocationPayload]


app = FastAPI()
Instrumentator().instrument(app).expose(app, endpoint="/metrics")
CONFIG_PATH = Path(__file__).with_name("config.json")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started_at = time.time()
    response = await call_next(request)

    if request.url.path != "/metrics":
        print(json.dumps({
            "event": "http_request",
            "service": "python-optimizer",
            "request_path": request.url.path,
            "http_method": request.method,
            "response_code": response.status_code,
            "duration_ms": int((time.time() - started_at) * 1000),
        }), flush=True)

    return response


def load_config():
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


@app.post("/optimize")
def optimize_route(payload: OptimizeRequest):
    depot = Point(lat=payload.depot.lat, lng=payload.depot.lng)
    points = [Point(lat=loc.lat, lng=loc.lng) for loc in payload.locations]
    config = load_config()
    max_cycle_size = int(config.get("max_cycle_size", 14))
    m = int(config.get("m", 4))

    start_time = time.time()
    route = clustered_tsp(depot, points, max_cycle_size=max_cycle_size, m=m)
    algorithm_time_ms = int((time.time() - start_time) * 1000)

    total_distance_km = calculate_route_distance(depot, points, route)

    return {
        "route": route,
        "totalDistanceKm": total_distance_km,
        "algorithmTimeMs": algorithm_time_ms,
        "algorithmName": "clustered_tsp_py",
    }
