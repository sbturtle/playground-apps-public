package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"syscall"
	"time"

	"example.com/jobqueue/internal/job"
	"example.com/jobqueue/internal/store"
	"example.com/jobqueue/internal/worker"
)

// 종료 신호를 받은 뒤 진행 중인 작업을 기다리는 최대 시간.
// 배포 환경(systemd TimeoutStopSec=15)보다 짧아야 결과를 저장하고 정상 종료할 수 있습니다.
const shutdownTimeout = 10 * time.Second

func main() {
	workers := flag.Int("workers", 4, "동시에 처리할 작업 수")
	outDir := flag.String("out", "./results", "결과 저장 폴더")
	flag.Parse()

	st, err := store.Open(*outDir)
	if err != nil {
		log.Fatalf("store: %v", err)
	}

	handlers := map[string]worker.Handler{
		"thumbnail": fakeWork(300*time.Millisecond, 0.1),
		"email":     fakeWork(100*time.Millisecond, 0.3),
	}
	pool := worker.NewPool(*workers, handlers)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool.Start(ctx)

	written := make(chan int, 1)
	go func() {
		n := 0
		for r := range pool.Results() {
			if err := st.Write(r); err != nil {
				log.Printf("결과 저장 실패 %s: %v", r.JobID, err)
				continue
			}
			n++
		}
		written <- n
	}()

	go feed(ctx, pool)

	<-ctx.Done()
	log.Println("종료 신호를 받았습니다. 진행 중인 작업을 마무리합니다.")

	stopped := make(chan struct{})
	go func() {
		pool.Wait()
		close(stopped)
	}()

	select {
	case <-stopped:
		log.Printf("정상 종료: 결과 %d건 저장, 처리 현황 %v", <-written, pool.Stats())
	case <-time.After(shutdownTimeout):
		log.Printf("종료 대기 %s 초과: 진행 중인 작업의 결과는 저장되지 않습니다.", shutdownTimeout)
		os.Exit(1)
	}
}

// feed는 데모용 작업을 계속 넣습니다.
func feed(ctx context.Context, pool *worker.Pool) {
	for i := 1; ; i++ {
		kind := "thumbnail"
		if i%3 == 0 {
			kind = "email"
		}
		j := job.Job{ID: fmt.Sprintf("job-%05d", i), Kind: kind, CreatedAt: time.Now()}
		if !pool.Submit(ctx, j) {
			return
		}
		time.Sleep(50 * time.Millisecond)
	}
}

func fakeWork(d time.Duration, failRate float64) worker.Handler {
	return func(ctx context.Context, j job.Job) error {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(d):
		}
		if rand.Float64() < failRate {
			return errors.New("일시적 오류")
		}
		return nil
	}
}
