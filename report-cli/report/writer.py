from __future__ import annotations

import csv
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

def write_csv(path: Path, data: dict) -> None:
    """사용자별 요약을 CVS로 씁니다."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(["user", "count", "total_seconds", "p95_seconds", "success_rate"])
        for user, s in data["users"].items():
            w.writerow([user, s["count"], s["total_seconds"], s["p95_seconds"], s["succes_rate"]])
