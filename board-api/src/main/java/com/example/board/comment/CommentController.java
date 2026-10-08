package com.example.board.comment;

import com.example.board.common.ForbiddenException;
import com.example.board.common.NotFoundException;
import com.example.board.post.Post;
import com.example.board.post.PostRepository;
import com.example.board.security.AuthInterceptor;
import com.example.board.security.CurrentUser;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    /** 댓글 목록 (최신 댓글 먼저). 글쓴이가 단 댓글에는 표시를 붙입니다. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<CommentResponse> list(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글이 없습니다: " + postId));
        List<Comment> comments = new ArrayList<>(commentRepository.findByPostIdOrderByCreatedAtAsc(postId));
        Collections.reverse(comments);
        return comments.stream()
                .map(c -> new CommentResponse(c.getId(), c.getAuthorId(), c.getAuthorId().equals(post.getAuthorId()), c.getContent(), c.getCreatedAt()))
                .toList();
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long postId, @PathVariable Long commentId,
                       @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> c.getPostId().equals(postId))
                .orElseThrow(() -> new NotFoundException("댓글이 없습니다: " + commentId));
        if (comment.getAuthorId() != user.id() && !user.isAdmin()) {
            throw new ForbiddenException("본인 댓글만 삭재할 수 있습니다.");
        }
        commentRepository.delete(comment);
    }
}
