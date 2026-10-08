package worker

import (
	"context"
	"time"
)

// Retry는 fn이 성공하거나 attempts번 실패할 때까지 지수 백오프(base, 2*base, 4*base...)로 다시 시도합니다.
// 대기를 마친 뒤 ctx가 취소됐으면 ctx.Err()를 돌려줍니다.
func Retry(ctx context.Context, attempts int, base time.Duration, fn func() error) error {
	var err error
	for i := 0; i < attempts; i++ {
		if err = fn(); err == nil {
			return nil
		}
		if i == attempts-1 {
			break
		}
		time.Sleep(base << i)
		if err := ctx.Err(); err != nil {
			return err
		}
	}
	return err
}
