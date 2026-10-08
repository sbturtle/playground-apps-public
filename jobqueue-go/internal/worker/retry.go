package worker

import (
	"context"
	"time"
)

// Retry는 fn이 성공하거나 attempts번 실패할 때까지 지수 백오프(base, 2*base, 4*base...)로
// 다시 시도합니다. 기다리는 동안 ctx가 취소되면 즉시 ctx.Err()를 돌려줍니다.
func Retry(ctx context.Context, attempts int, base time.Duration, fn func() error) error {
    var err error
    for i := 0; i < attempts; i++ {
        if err = fn(); err == nil {
            return nil
        }
        if i == attempts-1 {
            break
        }
        backoff := base << i
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(backoff):
        }
    }
    return err
}
