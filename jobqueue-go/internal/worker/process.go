package worker

import (
	"context"
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

	err := Retry(ctx, maxAttempts, retryBackoff, func() error { return h(ctx, j) })
	res.OK = err == nil
	if err != nil {
		res.Err = err.Error()
	}
	res.Duration = time.Since(start)

	// process는 워커 루프 안에서 순서대로 호출되므로 통계 갱신에 잠금이 필요 없습니다.
	p.stats[j.Kind]++
	return res
}
