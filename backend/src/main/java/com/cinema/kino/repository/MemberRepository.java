package com.cinema.kino.repository;

import com.cinema.kino.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 기본 findById 제공됨
}