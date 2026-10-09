package com.example.board.comment;

import com.example.board.security.AuthInterceptor;
import com.example.board.security.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /** 댓글 목록 (작성 순). size가 0이면 전체를 한 번에 돌려줍니다. */
    @GetMapping
    public List<CommentResponse> list(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return commentService.listComments(postId, page, size, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(
            @PathVariable Long postId,
            @RequestBody @Valid CommentCreateRequest request,
            @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return commentService.createComment(postId, request, user);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        commentService.deleteComment(postId, commentId, user);
    }
}
