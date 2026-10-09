# report-cli

서비스 이벤트 로그(CSV)를 사용자별로 요약해 JSON으로 출력합니다.

```bash
pip install -e ".[dev]"
report sample/events.csv --since 2026-03-01 --until 2026-03-03 -o out/summary.json
pytest
```

## 출력

```json
{
  "event_count": 5,
  "users": {
    "alice": { "count": 2, "total_seconds": 5.5, "p95_seconds": 4.3, "success_rate": 0.5 }
  }
}
```

- 시간 값은 모두 **초** 단위입니다.
- `--since`, `--until`에 시간대가 없으면 한국 시간(KST)으로 봅니다.

## 사용자 순위

`--rank`를 붙이면 요약 JSON 대신 사용자 순위 표를 출력합니다. 순위 표는 총 처리 시간이 긴 순서로 정렬됨니다.

- `--limit N`: 상위 N명만 보여 줍니다. 기본 10, `0`이면 전체를 보여 줍니다.
- 총 처리 시간이 같으면 같은 순위로 표시합니다.
- 표 마지막 줄은 표에 나온 사용자들의 합계입니다.
