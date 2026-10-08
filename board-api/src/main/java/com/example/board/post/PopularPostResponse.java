package com.example.board.post;

/** 인기글 목록 항목. 메인 화면에 필요한 최소 정보만 담습니다. */
public record PopularPostResponse(Long id, String title, String authorName, long viewCount) {

    public static PopularPostResponse from(Post post) {
        return new PopularPostResponse(post.getId(), post.getTitle(), post.getAuthorName(), post.getViewCount());
    }
}
