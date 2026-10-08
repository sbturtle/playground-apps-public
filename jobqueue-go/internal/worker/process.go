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

// process는 작업 하나를 처리하고 결과를 만듭니다. 실패하면 p.retries(작업당 최대 시도 회수)까지 다시 시도합니다.
func (p *Pool) process(ctx context.Context, j job.Job) job.Result {
	start := time.Now()
	res := job.Result{JobID: j.ID, Kind: j.Kind}

	h, ok := p.handlers[j.Kind]
	if !ok {
		res.Err = "알 수 없는 작업 종류: " + j.Kind
		return res
	}

	err := Retry(ctx, p.retries, retryBackoff, func() error { return h(ctx, j) })
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
