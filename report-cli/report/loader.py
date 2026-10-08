"""이벤트 CSV 로더.

CSV 컬럼: timestamp(ISO 8601, 시간대 포함), user, duration_ms, status, reason(실패 사우, 선택)
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
    reason: str = ""  # 실패 사유 (성공이면 빈 문자열)


def _parse_time(value: str) -> datetime:
    ts = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    if ts.tzinfo is None:
        raise ValueError(f"시간대 정보가 없는 timestamp: {value}")
    return ts


def load_events(path: Path) -> list[Event]:
    events: list[Event] = []
    with path.open(newline="", encoding="utf-8") as f:
        for line_no, row in enumerate(csv.DictReader(f), start=2):
            try:
                events.append(
                    Event(
                        timestamp=_parse_time(row["timestamp"]),
                        user=row["user"].strip(),
                        duration_ms=int(row["duration_ms"]),
                        ok=row["status"].strip().lower() == "ok",
                        reason=row["reason"].strip(),
                    )
                )
            except (KeyError, ValueError) as exc:
                raise ValueError(f"{path}:{line_no}: {exc}") from exc
    return events
