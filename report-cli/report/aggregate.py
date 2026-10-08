from __future__ import annotations

import math
from collections import Counter,defaultdict
from datetime import datetime

from .loader import Event


def filter_range(events: list[Event], since: datetime | None, until: datetime | None) -> list[Event]:
    """since 이상, until 미만인 이벤트만 남깁니다."""
    return [
        e
        for e in events
        if (since is None or e.timestamp >= since) and (until is None or e.timestamp < until)
    ]


def percentile(values: list[float], pct: float) -> float:
    """최근접 순위(nearest-rank) 방식 백분위수."""
    if not values:
        return 0.0
    ordered = sorted(values)
    rank = max(1, math.ceil(pct / 100 * len(ordered)))
    return ordered[rank - 1]


def summarize(events: list[Event]) -> dict:
    per_user: dict[str, list[Event]] = defaultdict(list)
    for e in events:
        per_user[e.user].append(e)

    users = {}
    for user, items in sorted(per_user.items()):
        seconds = [e.duration_ms / 1000 for e in items]
        users[user] = {
            "count": len(items),
            "total_seconds": round(sum(seconds), 3),
            "p95_seconds": round(percentile(seconds, 95), 3),
            "success_rate": round(sum(e.ok for e in items) / len(items), 4),
        }
    reasons = Counter(e.reason for e in events)
    return {"event_count": len(events), "users": users, "top_failure_reasons": [r for r, _ in reasons.most_common(3)]}
