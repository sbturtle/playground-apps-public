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

// Write는 결과를 <dir>/<JobID>.json으로 저장합니다.
func (s *Store) Write(r job.Result) error {
	data, err := json.Marshal(r)
	if err != nil {
		return err
	}
	name := filepath.Base(r.JobID) + ".json"
	return os.WriteFile(filepath.Join(s.dir, name), data, 0o644)
}
