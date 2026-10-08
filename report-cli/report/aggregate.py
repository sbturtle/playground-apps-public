from __future__ import annotations

import statistics
from collections import defaultdict
from datetime import datetime

from .loader import Event


def filter_range(events: list[Event], since: datetime | None, until: datetime | None) -> list[Event]:
    """since 이상, until 미만인 이벤트만 남깁니다."""
    return [
        e
        for e in events
        if (since is None or e.timestamp >= since) and (until is None or e.timestamp < until)
    ]


def percentile(values: list[float], pct: int) -> float:
    """선형 보간(inclusive) 방식 백분위수. pct는 1~99 정수입니다.

    표본이 적을 때 최근접 순위 방식은 최댓값으로 튀는 경우가 많아 보간 방식을 씁니다.
    """
    if not values:
        return 0.0
    if len(values) == 1:
        return float(values[0])
    cut_points = statistics.quantiles(values, n=100, method="inclusive")
    return cut_points[pct - 1]


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
    return {"event_count": len(events), "users": users}
