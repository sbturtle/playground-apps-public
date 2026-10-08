package com.example.board.security;

/** 로그인한 사용자. 인증 인터셉터가 요청 속성(currentUser)에 넣어 줍니다. */
public record CurrentUser(Long id, String nickname, Role role) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
