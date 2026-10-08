# report-cli

서비스 이벤트 로그(CSV)를 사용자별로 요약해 JSON으로 출력합니다.

```bash
pip install -e ".[dev]"
report --version
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
