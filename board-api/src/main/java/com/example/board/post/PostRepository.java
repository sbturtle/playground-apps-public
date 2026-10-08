package com.example.board.post;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    /** 제목에 keyword가 들어간 글 (최신순) */
    List<Post> findByTitleContainingOrderByCreatedAtDesc(String keyword);
}
