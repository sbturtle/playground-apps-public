package com.example.board.post;

import com.example.board.security.AuthInterceptor;
import com.example.board.security.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostResponse> list(@RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return postService.listPosts(user);
    }

    @GetMapping("/{postId}")
    public PostResponse get(@PathVariable Long postId, @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return postService.getPost(postId, user);
    }

    @PutMapping("/{postId}")
    public PostResponse update(
            @PathVariable Long postId,
            @RequestBody @Valid PostUpdateRequest request,
            @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return postService.updatePost(postId, request, user);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long postId, @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        postService.deletePost(postId, user);
    }

    /** 관리자 일괄 삭제. 요청 본문은 삭제할 글 ID 배열입니다. */
    @PostMapping("/bulk-delete")
    public BulkDeleteResult bulkDelete(
            @RequestBody List<Long> postIds, @RequestAttribute(AuthInterceptor.CURRENT_USER) CurrentUser user) {
        return postService.deletePosts(postIds, user);
    }
}
