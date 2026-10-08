package com.example.board.post;

import java.util.List;

public record BulkDeleteResult(List<Long> deleted, List<Long> failed) {
}
