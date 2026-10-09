from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path


def write_json(path: Path | None, data: dict) -> None:
    """path가 없으면 표준 출력에 씁니다.

    path가 있으면 같은 폴더의 임시 파일에 먼저 쓴 뒤 교체해서,
    중간에 실패해도 기존 결과 파일이 깨지지 않게 합니다.
    """
    text = json.dumps(data, ensure_ascii=False, indent=2)
    if path is None:
        sys.stdout.write(text + "\n")
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


def write_table(rows: list[dict]) -> None:
    """순위 표를 표준 출력에 씁니다. 마지막 줄에는 표에 나온 사용자들의 합을 붙입니다."""
    print(f"{'순위':>4}  {'사용자':<12}{'요청 수':>8}{'총 시간(초)':>12}{'성공률':>8}")
    for r in rows:
        print(f"{r['rank']:>4}  {r['user']:<12}{r['count']:>8}{r['total_seconds']:>12.3f}{r['success_rate']:>8.1%}")
    total_count = sum(r["count"] for r in rows)
    total_seconds = sum(r["total_seconds"] for r in rows)
    print(f"{'소게':>4}  {'':<12}{total_count:>8}{total_seconds:>12.3f}")
