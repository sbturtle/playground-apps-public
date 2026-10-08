package export

import (
	"bufio"
	"io"
	"os"
	"path/filepath"
	"sort"
)

// Results는 dir 안의 결과 파일(*.json)을 이름순으로 합쳐 JSON Lines 파일 하나로 씁니다.
// 쓴 결과 건수를 돌려줍니다.
func Results(dir, out string) (int, error) {
	files, err := filepath.Glob(filepath.Join(dir, "*.json"))
	if err != nil {
		return 0, err
	}
	sort.Strings(files)

	w, err := os.Create(out)
	if err != nil {
		return 0, err
	}
	defer w.Close()
	bw := bufio.NewWriter(w)

	count := 0
	for _, path := range files {
		f, err := os.Open(path)
		if err != nil {
			return count, err
		}
		defer f.Close()
		if _, err := io.Copy(bw, f); err != nil {
			return count, err
		}
		if err := bw.WriteByte('\n'); err != nil {
			return count, err
		}
		count++
	}
	return count, bw.Flush()
}
