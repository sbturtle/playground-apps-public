from datetime import datetime, timezone

from report.aggregate import filter_range, percentile, rank_users, summarize
from report.loader import Event


def ev(user: str, ms: int, ok: bool = True, hour: int = 0) -> Event:
    return Event(datetime(2026, 3, 1, hour, tzinfo=timezone.utc), user, ms, ok)


def test_percentile_nearest_rank():
    assert percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95) == 10
    assert percentile([5], 95) == 5
    assert percentile([], 95) == 0.0


def test_summarize_per_user():
    out = summarize([ev("a", 1000), ev("a", 3000, ok=False), ev("b", 500)])
    assert out["event_count"] == 3
    assert out["users"]["a"] == {"count": 2, "total_seconds": 4.0, "p95_seconds": 3.0, "success_rate": 0.5}
    assert out["users"]["b"]["total_seconds"] == 0.5


def test_filter_range_is_half_open():
    events = [ev("a", 1, hour=h) for h in range(5)]
    since = datetime(2026, 3, 1, 1, tzinfo=timezone.utc)
    until = datetime(2026, 3, 1, 3, tzinfo=timezone.utc)
    assert [e.timestamp.hour for e in filter_range(events, since, until)] == [1, 2]


def test_rank_users_orders_by_total_seconds():
    summary = summarize([ev("a", 1000), ev("b", 3000), ev("c", 2000)])
    rows = rank_users(summary, limit=2)
    assert [(r["rank"], r["user"]) for r in rows] == [(1, "b"), (2, "c")]
