package com.example.board.post;

import com.example.board.attachment.AttachmentStorage;
import com.example.board.comment.CommentRepository;
import com.example.board.common.ForbiddenException;
import com.example.board.common.NotFoundException;
import com.example.board.security.CurrentUser;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AttachmentStorage attachmentStorage;

    public PostService(PostRepository postRepository, CommentRepository commentRepository, AttachmentStorage attachmentStorage) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.attachmentStorage = attachmentStorage;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> listPosts(CurrentUser viewer) {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> PostResponse.of(post, viewer))
                .toList();
    }

    @Transactional
    public PostResponse getPost(Long postId, CurrentUser viewer) {
        Post post = findPost(postId);
        post.increaseViewCount();
        return PostResponse.of(post, viewer);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, CurrentUser user) {
        Post post = findPost(postId);
        if (!post.getAuthorId().equals(user.id()) && !user.isAdmin()) {
            throw new ForbiddenException("본인 글만 수정할 수 있습니다.");
        }
        post.update(request.title(), request.content());
        return PostResponse.of(post, user);
    }

    /** 게시글과 댓글, 첨부 파일을 함께 지웁니다. 중간에 실패하면 전체를 되돌립니다. */
    @Transactional
    public void deletePost(Long postId, CurrentUser user) {
        Post post = findPost(postId);
        if (!post.getAuthorId().equals(user.id()) && !user.isAdmin()) {
            throw new ForbiddenException("본인 글만 삭제할 수 있습니다.");
        }
        commentRepository.deleteByPostId(postId);
        attachmentStorage.deleteAll(post.getAttachmentKeys());
        postRepository.delete(post);
    }

    /**
     * 관리자 일괄 삭제. 글마다 deletePost를 호출하고, 실패한 글은 건너뛴 뒤 결과에 모아 돌려줍니다.
     * deletePost가 @Transactional이라 글 하나가 실패해도 그 글만 롤백됩니다.
     */
    public BulkDeleteResult deletePosts(List<Long> postIds, CurrentUser admin) {
        if (!admin.isAdmin()) {
            throw new ForbiddenException("관리자만 일괄 삭제할 수 있습니다.");
        }
        List<Long> deleted = new ArrayList<>();
        List<Long> failed = new ArrayList<>();
        for (Long postId : postIds) {
            try {
                deletePost(postId, admin);
                deleted.add(postId);
            } catch (RuntimeException e) {
                failed.add(postId);
            }
        }
        return new BulkDeleteResult(deleted, failed);
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글이 없습니다: " + postId));
    }
}
