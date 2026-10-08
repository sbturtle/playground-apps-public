package worker

import (
	"context"
	"sync"

	"example.com/jobqueue/internal/job"
)

// Handler는 작업 하나를 처리합니다. 일시적인 오류면 error를 돌려주고, Pool이 재시도합니다.
type Handler func(ctx context.Context, j job.Job) error

// Pool은 size개의 워커 고루틴으로 작업을 동시에 처리합니다.
type Pool struct {
	size     int
	retries  int
	handlers map[string]Handler
	jobs     chan job.Job
	results  chan job.Result
	wg       sync.WaitGroup

	mu    sync.Mutex
	stats map[string]int // 종류별 처리 건수
}

// NewPool은 size개 워커와 작업당 최대 시도 횟수 retries로 Pool을 만듭니다.
func NewPool(size int, handlers map[string]Handler, retries int) *Pool {
	return &Pool{
		size:     size,
		retries:  retries,
		handlers: handlers,
		jobs:     make(chan job.Job, size*2),
		results:  make(chan job.Result, size*2),
		stats:    make(map[string]int),
	}
}

// Start는 워커 고루틴을 띄웁니다. ctx가 취소되면 각 워커는 처리 중인 작업을 마친 뒤 종료합니다.
func (p *Pool) Start(ctx context.Context) {
	for i := 0; i < p.size; i++ {
		p.wg.Add(1)
		go func() {
			defer p.wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case j := <-p.jobs:
					p.results <- p.process(ctx, j)
				}
			}
		}()
	}
}

// Submit은 작업을 큐에 넣습니다. ctx가 취소되면 false를 돌려줍니다.
func (p *Pool) Submit(ctx context.Context, j job.Job) bool {
	select {
	case p.jobs <- j:
		return true
	case <-ctx.Done():
		return false
	}
}

// Wait는 모든 워커가 끝날 때까지 기다린 뒤 결과 채널을 닫습니다.
func (p *Pool) Wait() {
	p.wg.Wait()
	close(p.results)
}

func (p *Pool) Results() <-chan job.Result {
	return p.results
}

// Snapshot은 로그용으로 처리 건수 맵을 그대로 돌려줍니다. 자주 부르므로 복사·잠금 없이 돌려줍니다.
func (p *Pool) Snapshot() map[string]int {
    return p.stats
}

// Stats는 종류별 처리 건수의 복사본을 돌려줍니다.
func (p *Pool) Stats() map[string]int {
	p.mu.Lock()
	defer p.mu.Unlock()
	out := make(map[string]int, len(p.stats))
	for k, v := range p.stats {
		out[k] = v
	}
	return out
}
