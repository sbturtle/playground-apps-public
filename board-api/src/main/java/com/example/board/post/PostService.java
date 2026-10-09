package com.example.board.post;

import com.example.board.attachment.AttachmentStorage;
import com.example.board.comment.CommentRepository;
import com.example.board.common.ForbiddenException;
import com.example.board.common.NotFoundException;
import com.example.board.security.CurrentUser;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    /** 정렬 이름 → 컬럼. 쿼리에는 이 목록에 있는 컬럼만 넣습니다. */
    private static final Map<String, String> SORT_COLUMNS = Map.of("latest", "created_at", "views", "view_count");

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AttachmentStorage attachmentStorage;
    private final EntityManager entityManager;

    public PostService(
            PostRepository postRepository,
            CommentRepository commentRepository,
            AttachmentStorage attachmentStorage,
            EntityManager entityManager) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.attachmentStorage = attachmentStorage;
        this.entityManager = entityManager;
    }

	/** 정렬 기준과 방향에 따라 글 목록을 돌려줌니다. */
	@Transactional(readOnly = true)
	public List<PostResponse> listPosts(CurrentUser viewer, String sort, String order) {
		String column = SORT_COLUMNS.getOrDefault(sort, "created_at");
		List<Post> posts = entityManager
				.createNativeQuery("select * from post order by " + column + " " + order, Post.class)
				.getResultList();
		return posts.stream().map(post -> PostResponse.of(post, viewer)).toList();
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

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글이 없습니다: " + postId));
    }
}
