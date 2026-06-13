#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


SERVICES = [
    "auth-service",
    "delivery-service",
    "order-service",
    "notification-service",
    "python-optimizer",
    "frontend",
]


def update_file(path: Path, namespace: str, tag: str) -> bool:
    original = path.read_text()
    updated = original

    for service in SERVICES:
        pattern = rf'(image:\s*docker\.io/{re.escape(namespace)}/{re.escape(service)}:)[^"\n]+'
        updated = re.sub(pattern, rf'\1{tag}', updated)

    if updated != original:
        path.write_text(updated)
        return True

    return False


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: update-helm-image-tags.py <namespace> <tag>", file=sys.stderr)
        return 1

    namespace = sys.argv[1]
    tag = sys.argv[2]

    root = Path(__file__).resolve().parents[1]
    files = [
        root / "gitops/charts/drone-delivery/values.yaml",
        root / "gitops/charts/drone-delivery/values-dev.yaml",
        root / "gitops/charts/drone-delivery/values-prod.yaml",
    ]

    changed = False
    for path in files:
        changed = update_file(path, namespace, tag) or changed

    print(f"updated={changed} tag={tag} namespace={namespace}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())