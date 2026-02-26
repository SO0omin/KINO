package com.cinema.kino.repository;

import com.cinema.kino.entity.MembershipCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembershipCardRepository extends JpaRepository<MembershipCard, Long> {

    @Query("""
            SELECT c
            FROM MembershipCard c
            WHERE c.member.id = :memberId
            ORDER BY c.createdAt DESC, c.id DESC
            """)
    List<MembershipCard> findByMemberId(@Param("memberId") Long memberId);

    Optional<MembershipCard> findByCardNumber(String cardNumber);
}
