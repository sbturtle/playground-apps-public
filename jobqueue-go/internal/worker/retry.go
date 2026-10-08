package worker

import (
	"context"
	"fmt"
	"time"
)

// Retry는 fn이 성공하거나 attempts번 실패할 때까지 지수 백오프(base, 2*base, 4*base...)로 다시 시도합니다.
// 기다리는 동안 ctx가 취소되면 즉시 ctx.Err()를 돌려줍니다.
// 모든 시도가 실패하면 마지막 오류를 *AttemptsError로 감싸 돌려줍니다.
func Retry(ctx context.Context, attempts int, base time.Duration, fn func() error) error {
	var err error
	for i := 0; i < attempts; i++ {
		if err = fn(); err == nil {
			return nil
		}
		if i == attempts-1 {
			break
		}
		timer := time.NewTimer(base << i)
		select {
		case <-ctx.Done():
			timer.Stop()
			return ctx.Err()
		case <-timer.C:
		}
	}
	return &AttemptsError{Attempts: attempts, Err: err}
}

// AttemptsError는 모든 시도가 실패했을 때의 마지막 오류와 시도 횟수입니다.
type AttemptsError struct {
	Attempts int
	Err      error
}

func (e *AttemptsError) Error() string {
	return fmt.Sprintf("%v (%d회 시도)", e.Err, e.Attempts)
}

// Unwrap은 errors.Is/errors.As가 원래 오류를 찾을 수 있게 합니다.
func (e *AttemptsError) Unwrap() error { return e.Err }
