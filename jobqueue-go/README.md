# jobqueue-go

작업(썸네일 생성, 메일 발송 등)을 여러 워커 고루틴으로 동시에 처리하는 예제입니다.

```bash
go run ./cmd/worker -workers 4 -out ./results
```

- 작업이 실패하면 지수 백오프로 최대 6번까지 다시 시도합니다.
- `-timeout`으로 작업 종류별 처리 제한 시간을 정합니다 (예: `-timeout thumbnail=2s,email=500ms`, 기본 `thumbnail=2s`). 목록에 없는 종류는 제한 없이 처리합니다.
- 제한 시간을 넘긴 시도는 실패로 보고 다시 시도함니다. 처리 중인 작업은 제한 시간의 절반마다 '처리 중' 로그를 남깁니다.
- 종료 신호(SIGINT/SIGTERM)를 받으면 새 작업을 받지 않고, 진행 중인 작업을 최대 10초 기다린 뒤 종료합니다.
- 결과는 작업마다 `<out>/<jobId>.json`으로 저장되고, `export.Results`로 JSON Lines 하나로 합칠 수 있습니다.
