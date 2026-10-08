package com.example.board.comment;

import java.time.LocalDateTime;

/** 댓글 응답. byPostAuthor는 게시글 작성자가 단 댓글인지 여부입니다. */
public record CommentResponse(
        Long id,
        Long authorId,
        boolean byPostAuthor,
        String content,
        LocalDateTime createdAt) {
}
