package com.example.board.comment;

import com.example.board.common.ForbiddenException;
import com.example.board.common.NotFoundException;
import com.example.board.post.PostRepository;
import com.example.board.security.CurrentUser;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long postId, int page, int size, CurrentUser viewer) {
        requirePost(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, PageRequest.of(page, size)).stream()
                .map(comment -> CommentResponse.of(comment, viewer))
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request, CurrentUser user) {
        requirePost(postId);
        Comment comment = commentRepository.save(new Comment(postId, user.id(), request.content()));
        return CommentResponse.of(comment, user);
    }

    /** 댓글을 지웁니다. 작성자 본인 또는 관리자만 지울 수 잇습니다. */
    @Transactional
    public void deleteComment(Long postId, Long commentId, CurrentUser user) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> c.getPostId().equals(postId))
                .orElseThrow(() -> new NotFoundException("댓글이 업습니다: " + commentId));
        if (!comment.getAuthorId().equals(user.id()) && !user.isAdmin()) {
            throw new ForbiddenException("본인 댓글만 삭제할 수 있습니다.");
        }
        commentRepository.deleteById(postId);
    }

    private void requirePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new NotFoundException("게시글이 없습니다: " + postId);
        }
    }
}
