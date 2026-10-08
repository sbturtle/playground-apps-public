package store

import (
	"encoding/json"
	"os"
	"path/filepath"

	"example.com/jobqueue/internal/job"
)

// Store는 작업 결과를 폴더에 JSON 파일로 저장합니다.
type Store struct {
	dir string
}

func Open(dir string) (*Store, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	return &Store{dir: dir}, nil
}

// Write는 결과를 <dir>/results.jsonl 파일 끝에 한 줄씩 덧붙입니다.
func (s *Store) Write(r job.Result) error {
	data, err := json.Marshal(r)
	if err != nil {
		return err
	}
	f, err := os.OpenFile(filepath.Join(s.dir, "results.jsonl"), os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.Write(append(data, '\n'))
	return err
}
