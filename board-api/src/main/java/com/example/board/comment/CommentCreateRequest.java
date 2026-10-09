package com.example.board.comment;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateRequest(@NotBlank String content) {
}
