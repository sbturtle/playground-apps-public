package export

import (
	"bufio"
	"fmt"
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
		if err := appendFile(bw, path); err != nil {
			return count, fmt.Errorf("%s: %w", path, err)
		}
		count++
	}
	return count, bw.Flush()
}

// appendFile은 파일 하나를 w에 복사하고 줄바꿈을 붙입니다.
// 반복문 안의 defer는 함수가 끝날 때까지 파일을 열어 두므로, 파일마다 함수로 분리해 바로 닫습니다.
func appendFile(w *bufio.Writer, path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err := io.Copy(w, f); err != nil {
		return err
	}
	return w.WriteByte('\n')
}
