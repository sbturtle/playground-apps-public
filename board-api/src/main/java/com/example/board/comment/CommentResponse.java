package com.example.board.comment;

import com.example.board.security.CurrentUser;
import java.time.LocalDateTime;

/** 댓글 응답. 익명 글에 단 댓글로 작성자가 드러나지 않도록 작성자 정보 없이 본인 댓글 여부만 넣습니다. */
public record CommentResponse(Long id, String content, boolean mine, LocalDateTime createdAt) {

  public static CommentResponse of(Comment comment, CurrentUser viewer) {
    return new CommentResponse(
        comment.getId(), comment.getContent(), comment.getAuthorId().equals(viewer.id()), comment.getCreatedAt());
  }
}
