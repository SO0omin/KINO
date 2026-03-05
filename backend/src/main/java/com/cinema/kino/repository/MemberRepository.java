package com.cinema.kino.repository;

import com.cinema.kino.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByUsername(String username); //로그인 시 username(아이디) 찾기

    boolean existsByUsername(String username); // username(아이디) 중복체크
    boolean existsByEmail(String email); // 이메일 중복체크

    Optional<Member> findByNameAndEmail(String name, String email);
    Optional<Member> findByUsernameAndEmail(String username, String email);
}