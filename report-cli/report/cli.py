from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .aggregate import filter_range, summarize
from .loader import load_events
from .writer import write_json

KST = timezone(timedelta(hours=9))


def parse_date(value: str) -> datetime:
    """YYYY-MM-DD 또는 ISO 8601. 시간대가 없으면 KST로 간주합니다."""
    dt = datetime.fromisoformat(value)
    return dt if dt.tzinfo else dt.replace(tzinfo=KST)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="report", description="이벤트 CSV를 사용자별로 요약합니다.")
    parser.add_argument("input", type=Path, help="이벤트 CSV 경로")
    parser.add_argument("--since", help="이 시각 이후(포함)만 집계")
    parser.add_argument("--until", help="이 시각 이전(미포함)만 집계")
    parser.add_argument("-o", "--out", type=Path, help="결과 JSON 경로 (없으면 표준 출력)")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        events = load_events(args.input)
    except (OSError, ValueError) as exc:
        print(f"입력 오류: {exc}", file=sys.stderr)
        return 2

    since = parse_date(args.since) if args.since else None
    until = parse_date(args.until) if args.until else None
    summary = summarize(filter_range(events, since, until))

    if args.out:
        write_json(args.out, summary)
        total = sum(user["total_seconds"] for user in summary["users"].values())
        print(f"{summary['event_count']}건 집계 (총 소요 {total:,.1f}ms) → {args.out}")
    else:
        write_json(None, summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
