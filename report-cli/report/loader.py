"""이벤트 CSV 로더.

CSV 컬럼: timestamp(ISO 8601, 시간대 포함), user, duration_ms 또는 duration_s, status
- duration_ms: 밀리초 정수 (기존 형식)
- duration_s: 초 단위 실수 (새 수집기 형식, 예: 1.25)
예: 2026-03-01T09:00:00+09:00,alice,1200,ok
"""
from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


@dataclass(frozen=True)
class Event:
    timestamp: datetime  # 항상 시간대 정보가 있는 값
    user: str
    duration_ms: int
    ok: bool


def _parse_time(value: str) -> datetime:
    ts = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    if ts.tzinfo is None:
        raise ValueError(f"시간대 정보가 없는 timestamp: {value}")
    return ts


def _parse_duration_ms(row: dict[str, str]) -> int:
    if row.get("duration_ms"):
        return int(row["duration_ms"])
    return round(float(row["duration_s"]))


def load_events(path: Path) -> list[Event]:
    events: list[Event] = []
    with path.open(newline="", encoding="utf-8") as f:
        for line_no, row in enumerate(csv.DictReader(f), start=2):
            try:
                events.append(
                    Event(
                        timestamp=_parse_time(row["timestamp"]),
                        user=row["user"].strip(),
                        duration_ms=_parse_duration_ms(row),
                        ok=row["status"].strip().lower() == "ok",
                    )
                )
            except (KeyError, ValueError) as exc:
                raise ValueError(f"{path}:{line_no}: {exc}") from exc
    return events
