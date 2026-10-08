package com.example.board.post;

import com.example.board.security.CurrentUser;
import java.time.LocalDateTime;

/**
 * 게시글 응답. 익명 글의 작성자는 본인과 관리자에게만 보이고,
 * 다른 사용자에게는 "익명"으로 표시됩니다.
 */
public record PostResponse(
        Long id,
        Long authorId,
        String title,
        String content,
        String authorName,
        boolean mine,
        long viewCount,
        LocalDateTime createdAt) {

    public static final String ANONYMOUS_NAME = "익명";

    public static PostResponse of(Post post, CurrentUser viewer) {
        boolean mine = post.getAuthorId().equals(viewer.id());
        String author = post.isAnonymous() && !mine && !viewer.isAdmin() ? ANONYMOUS_NAME : post.getAuthorName();
        return new PostResponse(
                post.getId(),
                post.getAuthorId(),
                post.getTitle(),
                post.getContent(),
                author,
                mine,
                post.getViewCount(),
                post.getCreatedAt());
    }
}
