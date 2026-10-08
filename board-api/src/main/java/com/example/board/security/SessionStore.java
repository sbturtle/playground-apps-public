package com.example.board.security;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/** 로그인 세션 저장소 (토큰 → 사용자). 로그인 API가 토큰을 발급하며 넣습니다. */
@Component
public class SessionStore {

    private final Map<String, CurrentUser> sessions = new ConcurrentHashMap<>();

    public void put(String token, CurrentUser user) {
        sessions.put(token, user);
    }

    public Optional<CurrentUser> find(String token) {
        return Optional.ofNullable(sessions.get(token));
    }
}
