# jobqueue-go

작업(썸네일 생성, 메일 발송 등)을 여러 워커 고루틴으로 동시에 처리하는 예제입니다.

```bash
go run ./cmd/worker -workers 4 -out ./results
```

- 작업이 실패하면 지수 백오프로 다시 시도합니다. 최대 시도 횟수는 `-retries`로 정합니다 (기본 5).
- 5초마다 종류별 처리 건수를 로그로 남깁니다.
- 종료 신호(SIGINT/SIGTERM)를 받으면 새 작업을 받지 않고, 진행 중인 작업을 최대 10초 기다린 뒤 종료합니다.
- 결과는 작업마다 `<out>/<jobId>.json`으로 저장되고, `export.Results`로 JSON Lines 하나로 합칠 수 있습니다.
