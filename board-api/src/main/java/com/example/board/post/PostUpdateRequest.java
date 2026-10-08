package com.example.board.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 게시글 수정 요청.
 * authorId: 관리자가 작성자를 대신해 수정할 때 원 작성자 ID를 넣습니다. 일반 수정이면 비워 둡니다.
 */
public record PostUpdateRequest(
        @NotBlank @Size(max = 100) String title,
        @NotBlank String content,
        Long authorId) {
}
