package job

import "time"

// Job은 워커가 처리할 작업 하나입니다.
type Job struct {
	ID        string
	Kind      string
	Payload   []byte
	CreatedAt time.Time
}

// Result는 작업 처리 결과입니다. store가 JSON 파일로 저장합니다.
type Result struct {
	JobID    string        `json:"jobId"`
	Kind     string        `json:"kind"`
	OK       bool          `json:"ok"`
	Err      string        `json:"error,omitempty"`
	Duration time.Duration `json:"durationNs"`
}
