package com.cinema.kino.service;

import com.cinema.kino.dto.ReviewSaveRequestDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.Movie;
import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.Review;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.MovieRepository;
import com.cinema.kino.repository.ReviewRepository;
import com.cinema.kino.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public void saveReview(Long memberId, ReviewSaveRequestDTO dto) {
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("영화를 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        // 2. 예매 번호 검증 로직 💡
        // - 예매 번호가 존재하는지?
        // - 해당 예매가 로그인한 회원의 것이 맞는지?
        // - 해당 예매가 리뷰를 쓰려는 영화의 예매가 맞는지?
        Reservation reservation = reservationRepository.findByReservationNumber(dto.getReservationNumber())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 예매 번호입니다."));

        if (!reservation.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 예매 내역이 아닙니다.");
        }

        if (!reservation.getScreening().getMovie().getId().equals(dto.getMovieId())) {
            throw new IllegalArgumentException("해당 영화의 예매 내역이 아닙니다.");
        }

        // 3. (선택사항) 이미 이 예매 번호로 리뷰를 작성했는지 체크하면 더 좋습니다.

        Review review = Review.builder()
                .content(dto.getContent())
                .scoreDirection(dto.getScoreDirection())
                .scoreStory(dto.getScoreStory())
                .scoreVisual(dto.getScoreVisual())
                .scoreActor(dto.getScoreActor())
                .scoreOst(dto.getScoreOst())
                .movie(movie)
                .member(member)
                .build();

        reviewRepository.save(review);
    }
}