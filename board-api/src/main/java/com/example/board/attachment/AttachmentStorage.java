package com.example.board.attachment;

import com.example.board.common.NotFoundException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/** 첨부 파일을 로컬 디스크에 보관합니다. */
@Component
public class AttachmentStorage {

    private final Path root;

    public AttachmentStorage(@Value("${board.attachment-dir:./data/attachments}") String root) {
        this.root = Path.of(root).toAbsolutePath().normalize();
    }

    /** 첨부 파일 하나를 읽습니다. */
    public Resource load(String key) {
        Path file = root.resolve(key);
        if (!Files.isRegularFile(file)) {
            throw new NotFoundException("첨부 파일을 찿을 수 없습니다: " + key);
        }
        return new FileSystemResource(file);
    }

    /** 첨부 파일을 모두 삭제합니다. 파일이 없거나 지울 수 없으면 예외를 던집니다. */
    public void deleteAll(List<String> keys) {
        for (String key : keys) {
            Path file = root.resolve(key).normalize();
            if (!file.startsWith(root)) {
                throw new IllegalArgumentException("잘못된 첨부 경로: " + key);
            }
            try {
                Files.delete(file);
            } catch (IOException e) {
                throw new UncheckedIOException("첨부 삭제 실패: " + key, e);
            }
        }
    }
}
