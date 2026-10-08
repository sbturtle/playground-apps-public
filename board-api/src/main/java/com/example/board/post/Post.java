package com.example.board.post;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long authorId;

    /** 작성자 실명(닉네임). 익명 글이면 응답에서 가려야 합니다. */
    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private boolean anonymous;

    @Column(nullable = false)
    private long viewCount;

    @ElementCollection
    @CollectionTable(name = "post_attachment", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "storage_key", nullable = false)
    private List<String> attachmentKeys = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected Post() {
    }

    public Post(Long authorId, String authorName, String title, String content, boolean anonymous) {
        this.authorId = authorId;
        this.authorName = authorName;
        this.title = title;
        this.content = content;
        this.anonymous = anonymous;
        this.createdAt = LocalDateTime.now();
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public Long getId() {
        return id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public long getViewCount() {
        return viewCount;
    }

    public List<String> getAttachmentKeys() {
        return attachmentKeys;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
