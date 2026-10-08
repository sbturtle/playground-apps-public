package com.example.board.post;

import com.example.board.common.ForbiddenException;
import com.example.board.security.CurrentUser;
import java.util.Objects;
import org.springframework.stereotype.Component;

/** 게시글 작성자·관리자 권한 검사. */
@Component
public class PostGuard {

    /** 작성자 본인이나 관리자가 아니면 ForbiddenException을 던집니다. action 예: "수정", "삭제" */
    public void requireOwnerOrAdmin(Post post, CurrentUser user, String action) {
        if (user.isAdmin() || Objects.equals(post.getAuthorId(), user.id())) {
            return;
        }
        throw new ForbiddenException("본인 글만 " + action + "할 수 있습니다.");
    }
}
