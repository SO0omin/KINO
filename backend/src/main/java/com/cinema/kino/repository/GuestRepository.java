package com.cinema.kino.repository;

import com.cinema.kino.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 비회원(Guest) 엔티티에 대한 데이터 접근 Repository
 *
 * 역할:
 * - Guest 엔티티의 CRUD 처리
 * - 기본 메서드는 JpaRepository에서 제공
 *
 * 상속 기능:
 * - save()
 * - findById()
 * - findAll()
 * - deleteById()
 * 등 기본적인 JPA 기능 사용 가능
 *
 * 현재는 추가 쿼리 메서드를 정의하지 않았으며,
 * 필요 시 Query Method 또는 @Query를 통해 확장 가능
 */
public interface GuestRepository extends JpaRepository<Guest, Long> {

    // JpaRepository에서 기본 findById(Long id) 제공됨
    // 향후 비회원 이메일/전화번호 기반 조회가 필요하면 메서드 추가 가능
}
