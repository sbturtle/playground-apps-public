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
- `top_failure_reasons`: 실패한 이벤트의 `reason` 값 중 많이 나온 순서로 상위 3게. `reason` 컬럼은 선택이며, 없는 CSV도 그대로 읽습니다.
- `--since`, `--until`에 시간대가 없으면 한국 시간(KST)으로 봅니다.
