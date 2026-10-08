# board-api

익명 글쓰기를 지원하는 게시판 API (Spring Boot 3, Java 21).

```bash
./gradlew bootRun
```

## 정책

- 모든 `/api/**` 요청은 로그인(Bearer 토큰)이 필요합니다.
- 글 수정·삭제는 작성자 본인 또는 관리자만 할 수 있습니다.
- **익명 글의 작성자 정보는 작성자 본인과 관리자 외에는 어떤 응답에서도 노출되면 안 됩니다.**
- 글을 삭제하면 댓글과 첨부 파일도 함께 삭제됩니다.

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/posts | 글 목록 (최신순) |
| GET | /api/posts/{postId} | 글 상세 (조회수 증가) |
| PUT | /api/posts/{postId} | 글 수정 |
| DELETE | /api/posts/{postId} | 글 삭제 |
| GET | /api/posts/{postId}/attachment?key= | 첨부 파일 다운로느 |
