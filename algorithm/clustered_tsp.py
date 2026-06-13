import math
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Point:
    lat: float
    lng: float


def calculate_distance_km(p1: Point, p2: Point) -> float:
    radius = 6371.0
    dlat = math.radians(p2.lat - p1.lat)
    dlng = math.radians(p2.lng - p1.lng)
    lat1 = math.radians(p1.lat)
    lat2 = math.radians(p2.lat)

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c


def build_distance_matrix(points: List[Point]) -> List[List[float]]:
    size = len(points)
    matrix = [[0.0 for _ in range(size)] for _ in range(size)]
    for i in range(size):
        for j in range(i + 1, size):
            dist = calculate_distance_km(points[i], points[j])
            matrix[i][j] = dist
            matrix[j][i] = dist
    return matrix


def build_preferences(distance_matrix: List[List[float]]) -> List[List[int]]:
    preferences = []
    for i, row in enumerate(distance_matrix):
        ordered = sorted([(dist, idx) for idx, dist in enumerate(row) if idx != i])
        preferences.append([idx for _, idx in ordered])
    return preferences


def calculate_cycle_distance(cycle: List[int], distance_matrix: List[List[float]]) -> float:
    if len(cycle) <= 1:
        return 0.0
    total = 0.0
    for i in range(len(cycle)):
        j = (i + 1) % len(cycle)
        total += distance_matrix[cycle[i]][cycle[j]]
    return total


def optimize_cycle(cycle: List[int], distance_matrix: List[List[float]]) -> List[int]:
    if len(cycle) <= 2:
        return cycle
    best = cycle[:]
    best_dist = calculate_cycle_distance(best, distance_matrix)
    for i in range(len(cycle)):
        rotated = cycle[i:] + cycle[:i]
        candidates = [rotated, list(reversed(rotated))]
        for candidate in candidates:
            dist = calculate_cycle_distance(candidate, distance_matrix)
            if dist < best_dist:
                best = candidate[:]
                best_dist = dist
    return best


def is_stable_cycle(cycle: List[int], preferences: List[List[int]], m: int) -> bool:
    if len(cycle) <= 1:
        return True
    cycle_set = set(cycle)
    for current in cycle:
        for other in preferences[current][:m]:
            if other in cycle_set:
                continue
            for c in cycle:
                if c == current:
                    continue
                if preferences[other].index(current) < preferences[other].index(c):
                    return False
    return True


def generate_combinations(items: List[int], size: int) -> List[List[int]]:
    results = []

    def backtrack(start: int, combo: List[int]):
        if len(combo) == size:
            results.append(combo[:])
            return
        for i in range(start, len(items)):
            combo.append(items[i])
            backtrack(i + 1, combo)
            combo.pop()

    backtrack(0, [])
    return results


def find_stable_cycle(remaining: List[int], preferences: List[List[int]], max_size: int, m: int) -> Optional[List[int]]:
    upper = min(max_size, len(remaining))
    for size in range(2, upper + 1):
        combos = generate_combinations(remaining, size)
        for combo in combos:
            if is_stable_cycle(combo, preferences, m):
                return combo
    return None


def find_stable_partition(
    points: List[Point],
    preferences: List[List[int]],
    distance_matrix: List[List[float]],
    max_size: int,
    m: int,
) -> List[List[int]]:
    remaining = list(range(len(points)))
    cycles: List[List[int]] = []

    while remaining:
        cycle = find_stable_cycle(remaining, preferences, max_size, m)
        if cycle:
            cycles.append(cycle)
            for city in cycle:
                if city in remaining:
                    remaining.remove(city)
            continue

        if len(remaining) >= 2:
            a = remaining[0]
            b_sel = next((b for b in preferences[a] if b in remaining), None)
            if b_sel is not None:
                cycles.append([a, b_sel])
                remaining.remove(a)
                remaining.remove(b_sel)
            else:
                cycles.append([a])
                remaining.remove(a)
        else:
            cycles.append([remaining[0]])
            remaining.remove(remaining[0])

    # Handle unstable 2-cycles by redistributing
    def is_unstable_two_cycle(cycle: List[int]) -> bool:
        if len(cycle) != 2:
            return False
        i, j = cycle
        return preferences[i].index(j) > 1 or preferences[j].index(i) > 1

    for cycle in cycles[:]:
        if not is_unstable_two_cycle(cycle):
            continue
        i, j = cycle
        cycles.remove(cycle)
        for city in [i, j]:
            best_idx = None
            best_dist = float("inf")
            for idx, other_cycle in enumerate(cycles):
                if is_unstable_two_cycle(other_cycle):
                    continue
                for c in other_cycle:
                    if preferences[city].index(c) < 4 and preferences[c].index(city) < 4:
                        dist = distance_matrix[city][c]
                        if dist < best_dist:
                            best_dist = dist
                            best_idx = idx
            if best_idx is not None:
                cycles[best_idx].append(city)
            else:
                cycles.append([city])

    optimized_cycles = [optimize_cycle(cycle, distance_matrix) for cycle in cycles]
    return optimized_cycles


def merge_singletons(cycles: List[List[int]], distance_matrix: List[List[float]]) -> List[List[int]]:
    singletons = [cycle[0] for cycle in cycles if len(cycle) == 1]
    filtered = [cycle for cycle in cycles if len(cycle) > 1]

    for city in singletons:
        best_idx = None
        best_dist = float("inf")
        for idx, cycle in enumerate(filtered):
            for c in cycle:
                dist = distance_matrix[city][c]
                if dist < best_dist:
                    best_dist = dist
                    best_idx = idx
        if best_idx is not None:
            filtered[best_idx].append(city)
            filtered[best_idx] = list(set(filtered[best_idx]))
        else:
            filtered.append([city])

    return filtered


def solve_hamiltonian_path_fixed_ends(distance_matrix: List[List[float]], start_idx: int, end_idx: int) -> List[int]:
    size = len(distance_matrix)
    if size <= 1:
        return [start_idx]
    if size == 2:
        return [start_idx, end_idx] if start_idx != end_idx else [start_idx]

    nodes = list(range(size))
    others = [v for v in nodes if v != start_idx]

    dp = {}
    for v in others:
        mask = 1 << others.index(v)
        dp[(mask, v)] = (distance_matrix[start_idx][v], start_idx)

    full_mask = (1 << len(others)) - 1
    for mask in range(1 << len(others)):
        for last in others:
            key = (mask, last)
            if key not in dp:
                continue
            cur_dist, _ = dp[key]
            for next_node in others:
                bit = 1 << others.index(next_node)
                if mask & bit:
                    continue
                new_mask = mask | bit
                new_dist = cur_dist + distance_matrix[last][next_node]
                key2 = (new_mask, next_node)
                if key2 not in dp or new_dist < dp[key2][0]:
                    dp[key2] = (new_dist, last)

    if end_idx == start_idx:
        return [start_idx] + [v for v in others]
    if end_idx not in others:
        return [start_idx, end_idx]

    key_final = (full_mask, end_idx)
    if key_final not in dp:
        return [start_idx, end_idx]

    path = [end_idx]
    mask = full_mask
    last = end_idx
    while last != start_idx:
        prev = dp[(mask, last)][1]
        path.append(prev)
        mask ^= 1 << others.index(last)
        last = prev
    path.reverse()
    return path


def solve_tsp_dynamic_programming(distance_matrix: List[List[float]]) -> List[int]:
    size = len(distance_matrix)
    if size <= 1:
        return [0]

    nodes = list(range(1, size))
    dp = {}
    for node in nodes:
        mask = 1 << nodes.index(node)
        dp[(mask, node)] = (distance_matrix[0][node], 0)

    full_mask = (1 << len(nodes)) - 1
    for mask in range(1 << len(nodes)):
        for last in nodes:
            key = (mask, last)
            if key not in dp:
                continue
            cur_dist, _ = dp[key]
            for next_node in nodes:
                bit = 1 << nodes.index(next_node)
                if mask & bit:
                    continue
                new_mask = mask | bit
                new_dist = cur_dist + distance_matrix[last][next_node]
                key2 = (new_mask, next_node)
                if key2 not in dp or new_dist < dp[key2][0]:
                    dp[key2] = (new_dist, last)

    best_dist = float("inf")
    best_last = nodes[0]
    for node in nodes:
        entry = dp.get((full_mask, node))
        if entry is None:
            continue
        dist = entry[0] + distance_matrix[node][0]
        if dist < best_dist:
            best_dist = dist
            best_last = node

    path = [0]
    mask = full_mask
    last = best_last
    reverse_path = [last]
    while last != 0:
        prev = dp[(mask, last)][1]
        reverse_path.append(prev)
        mask ^= 1 << nodes.index(last)
        last = prev
    reverse_path.reverse()
    return reverse_path


def expand_cluster_tsp_incremental(
    cycles: List[List[int]],
    cycle_permutation: List[int],
    distance_matrix: List[List[float]],
) -> Optional[List[int]]:
    if not cycles or not cycle_permutation:
        return None

    ordered_cycles = [list(dict.fromkeys(cycles[idx])) for idx in cycle_permutation]
    total_cycles = len(ordered_cycles)
    best_path = None
    best_dist = float("inf")

    def recurse(cycle_idx: int, current_start: int, remaining_cycles: List[List[int]], current_path: List[int]):
        nonlocal best_path, best_dist

        if cycle_idx == total_cycles - 1:
            last_cycle = remaining_cycles[0]
            local_nodes = last_cycle if current_start in last_cycle else [current_start] + last_cycle

            best_seq_local = None
            best_cost_local = float("inf")
            for end_candidate in local_nodes:
                if end_candidate == current_start:
                    continue
                sub_dm = [[distance_matrix[i][j] for j in local_nodes] for i in local_nodes]
                start_idx = local_nodes.index(current_start)
                end_idx = local_nodes.index(end_candidate)
                seq_local = solve_hamiltonian_path_fixed_ends(sub_dm, start_idx, end_idx)
                seq_global = [local_nodes[i] for i in seq_local]
                candidate_path = (
                    current_path + seq_global[1:]
                    if current_path[-1] == current_start
                    else current_path + seq_global
                )

                travel = sum(
                    distance_matrix[candidate_path[i]][candidate_path[i + 1]]
                    for i in range(len(candidate_path) - 1)
                )
                closing = distance_matrix[candidate_path[-1]][candidate_path[0]]
                total_cost = travel + closing

                if total_cost < best_cost_local:
                    best_cost_local = total_cost
                    best_seq_local = seq_global

            if best_seq_local:
                final_path = (
                    current_path + best_seq_local[1:]
                    if current_path[-1] == current_start
                    else current_path + best_seq_local
                )
                travel = sum(
                    distance_matrix[final_path[i]][final_path[i + 1]]
                    for i in range(len(final_path) - 1)
                )
                closing = distance_matrix[final_path[-1]][final_path[0]]
                total_cost = travel + closing
                if total_cost < best_dist:
                    best_dist = total_cost
                    best_path = final_path + [final_path[0]]
            return

        current_cycle = remaining_cycles[0]
        next_cycle = remaining_cycles[1]
        local_current = current_cycle if current_start in current_cycle else [current_start] + current_cycle

        for entry_next in next_cycle:
            union_nodes = list(dict.fromkeys(local_current + [entry_next]))
            sub_dm = [[distance_matrix[i][j] for j in union_nodes] for i in union_nodes]
            start_idx = union_nodes.index(current_start)
            end_idx = union_nodes.index(entry_next)
            seq_local = solve_hamiltonian_path_fixed_ends(sub_dm, start_idx, end_idx)
            seq_global = [union_nodes[i] for i in seq_local]
            segment = seq_global[:-1]
            new_path = (
                current_path + segment[1:]
                if current_path[-1] == current_start
                else current_path + segment
            )
            recurse(cycle_idx + 1, entry_next, remaining_cycles[1:], new_path)

    for start_node in ordered_cycles[0]:
        recurse(0, start_node, ordered_cycles, [start_node])

    return best_path


def calculate_route_distance(depot: Point, points: List[Point], route: List[int]) -> float:
    if not route:
        return 0.0
    total = 0.0
    current = depot
    for idx in route:
        total += calculate_distance_km(current, points[idx])
        current = points[idx]
    total += calculate_distance_km(current, depot)
    return total


def clustered_tsp(
    depot: Point,
    points: List[Point],
    max_cycle_size: int = 14,
    m: int = 4,
) -> List[int]:
    if not points:
        return []
    if len(points) == 1:
        return [0]

    distance_matrix = build_distance_matrix(points)
    preferences = build_preferences(distance_matrix)

    cycles = find_stable_partition(points, preferences, distance_matrix, max_cycle_size, m)
    cycles = merge_singletons(cycles, distance_matrix)

    centroids = []
    for cycle in cycles:
        lat_sum = 0.0
        lng_sum = 0.0
        for idx in cycle:
            lat_sum += points[idx].lat
            lng_sum += points[idx].lng
        centroids.append(Point(lat=lat_sum / len(cycle), lng=lng_sum / len(cycle)))

    centroid_matrix = build_distance_matrix(centroids)
    cycle_permutation = solve_tsp_dynamic_programming(centroid_matrix)
    expanded_path = expand_cluster_tsp_incremental(cycles, cycle_permutation, distance_matrix)

    if not expanded_path:
        return list(range(len(points)))

    return expanded_path[:-1]
