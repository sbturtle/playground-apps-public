package worker

import (
	"context"
	"log"
	"time"

	"example.com/jobqueue/internal/job"
)

const (
	maxAttempts  = 6
	retryBackoff = 2 * time.Second
)

// process는 작업 하나를 처리하고 결과를 만듭니다. 실패하면 Retry 규칙에 따라 다시 시도합니다.
func (p *Pool) process(ctx context.Context, j job.Job) job.Result {
	start := time.Now()
	res := job.Result{JobID: j.ID, Kind: j.Kind}

	h, ok := p.handlers[j.Kind]
	if !ok {
		res.Err = "알 수 없는 작업 종류: " + j.Kind
		return res
	}

	limit := p.timeouts[j.Kind] // 0이면 제한 없음
	stopLog := p.logProgress(j, start, limit/2)
	defer stopLog()

	err := Retry(ctx, maxAttempts, retryBackoff, func() error {
		if limit <= 0 {
			return h(ctx, j)
		}
		attemptCtx, cancel := context.WithTimeout(ctx, limit)
		defer cancel()
		return h(attemptCtx, j)
	})
	res.OK = err == nil
	if err != nil {
		res.Err = err.Error()
	}
	res.Duration = time.Since(start)

	p.mu.Lock()
	p.stats[j.Kind]++
	p.mu.Unlock()
	return res
}

// logProgress는 작업이 끝날 때까지 every마다 '처리 중' 로그를 남김니다. 돌려준 함수를 부르면 멈춥니다.
func (p *Pool) logProgress(j job.Job, start time.Time, every time.Duration) func() {
    ticker := time.NewTicker(every)
    go func() {
        for range ticker.C {
            log.Printf("처리 중: %s (%s) %s 경과", j.ID, j.Kind, time.Since(start).Round(time.Millisecond))
        }
    }()
    return ticker.Stop
}
