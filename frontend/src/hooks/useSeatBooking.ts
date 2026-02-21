/* ===================================
hooks/useSeatBooking에서는
1)데이터보관 및 관리, 
2)규칙(좌석 선택, 커플석), 
3)외부 통신과 같은 기능을 옮겨
pages/SeatBooking의 기능을 분산시킵니다.
=================================== */

import { useState, useEffect, useCallback } from "react";
import type { SeatStatusDto } from "../types/dtos/SeatStatusDto";
import type { SeatViewModel, ScreeningInfoViewModel } from "../types/models/SeatBookingViewModel"; // 이전에 만든 모델
import { toSeatViewModels, toScreeningInfoViewModel } from "../mappers/seatBookingMapper"; // 이전에 만든 매퍼
import { seatService } from "../SeatSocket";

export const useSeatBooking = (screeningId: number) => {
  //1)데이터보관 및 관리
  const [seats, setSeats] = useState<SeatViewModel[]>([]); // 가공된 좌석 데이터
  const [screeningInfo, setScreeningInfo] = useState<ScreeningInfoViewModel | null>(null); // 영화 정보
  const [selectedSeats, setSelectedSeats] = useState<SeatViewModel[]>([]); // 선택된 좌석들
  const [personnel, setPersonnel] = useState({ adult: 0, youth: 0, senior: 0, special: 0 }); // 인원 수
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 모달 오픈 여부
  const [alertMessage, setAlertMessage] = useState(""); // 모달 메시지
  const [showCoupleNotice, setShowCoupleNotice] = useState(false); // 커플석 여부

  const totalPersonnelCount = Object.values(personnel).reduce((a, b) => a + b, 0); // 인원 총합 계산
  const realSeats = seats.filter((s) => s.isRealSeat); //좌석만 필터링
  const entranceSeats = seats.filter((s) => s.isEntrance); //입/출구 필터링

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertOpen(true);
  }; //커스텀 모달

  //2)규칙(좌석 선택, 커플석 관리)
  
  // 파트너 좌석(커플석 등) 번호 계산 로직
    const getPartnerNumber = useCallback((currentSeat: SeatViewModel) => {
    // 1. 같은 줄, 같은 타입 좌석 중 '아직 선택되지 않은' 좌석들만 골라냅니다.
    // (단, 지금 내가 마우스를 올린 seat은 포함시켜야 계산이 됩니다.)
    const availableSameTypeSeats = realSeats
        .filter((s) => s.row === currentSeat.row && s.type === currentSeat.type)
        .filter((s) => !selectedSeats.some(sel => sel.id === s.id) || s.id === currentSeat.id)
        .sort((a, b) => a.number - b.number);

    const indexInGroup = availableSameTypeSeats.findIndex((s) => s.id === currentSeat.id);
    if (indexInGroup === -1 || availableSameTypeSeats.length < 2) return null;

    const groupSize = availableSameTypeSeats.length;

    // 2. 남은 좌석들끼리만 짝짓기 (8, 9번이 빠졌다면 6, 7번이 자동으로 끝 번호가 되어 짝이 됨)
    let partnerIdx: number;
    
    // 남은 그룹이 홀수개일 때 마지막 처리
    if (groupSize % 2 !== 0 && indexInGroup >= groupSize - 2) {
        partnerIdx = (indexInGroup === groupSize - 1) ? indexInGroup - 1 : indexInGroup + 1;
    } else {
        partnerIdx = (indexInGroup % 2 === 0) ? indexInGroup + 1 : indexInGroup - 1;
    }

    return availableSameTypeSeats[partnerIdx]?.number || null;
    }, [realSeats, selectedSeats]);

  // 인원 수 변경
  const handleCountChange = (type: keyof typeof personnel, delta: number) => {
    const nextCount = personnel[type] + delta;
    if (nextCount < 0) return;
    
    if (delta > 0 && totalPersonnelCount >= 8) {
      showAlert("최대 8명까지만 선택 가능합니다.");
      return;
    }
    
    if (delta < 0 && selectedSeats.length > (totalPersonnelCount - 1)) {
      showAlert("선택된 좌석보다 인원수가 적을 수 없습니다.");
      return;
    }
    setPersonnel({ ...personnel, [type]: nextCount });
  };

  // 좌석 선택/취소 토글
  const toggleSeat = (seat: SeatViewModel) => {
    if (totalPersonnelCount === 0) {
      showAlert("관람하실 인원을 먼저 선택해주세요.");
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    const remainingCount = totalPersonnelCount - selectedSeats.length;

    // [취소 로직]
    if (isAlreadySelected) {
      setSelectedSeats(prev => {
        const partnerNum = getPartnerNumber(seat);
        const pair = prev.find(s => s.row === seat.row && s.number === partnerNum && s.type === seat.type);
        if (pair) return prev.filter(s => s.id !== seat.id && s.id !== pair.id);
        return prev.filter(s => s.id !== seat.id);
      });
      return;
    }

    // [선택 로직]
    if (remainingCount <= 0) {
      showAlert("이미 모든 좌석을 선택하셨습니다.");
      return;
    }

    // 2명 이상 선택 가능 시 묶음 선택
    if (remainingCount >= 2) {
      const partnerNum = getPartnerNumber(seat);
      const partnerSeat = realSeats.find(s => s.row === seat.row && s.number === partnerNum && s.type === seat.type);

      const isPartnerAlreadySelected = selectedSeats.some(s => s.id === partnerSeat?.id);

      if (partnerSeat && partnerSeat.status !== "RESERVED" && !isPartnerAlreadySelected) {
        setSelectedSeats([...selectedSeats, seat, partnerSeat]);
        return;
      }
    }

    // 1명 남았을 때 단일 선택 제한 체크
    if (remainingCount === 1) {
      const sameTypeSeats = realSeats.filter(s => s.row === seat.row && s.type === seat.type).sort((a, b) => a.number - b.number);
      const indexInGroup = sameTypeSeats.findIndex(s => s.id === seat.id);
      const groupSize = sameTypeSeats.length;
      if ((indexInGroup % 2 !== 0) && !(groupSize % 2 !== 0 && indexInGroup === groupSize - 1)) {
        showAlert("해당 좌석은 단독으로 선택할 수 없습니다.");
        return;
      }
    }
    
    setSelectedSeats([...selectedSeats, seat]);

    // WebSocket을 통해 서버에 점유 메시지 전송(이후 넘어오는 값들로 수정해야함)
    seatService.holdSeat({
      screeningId,
      seatId: seat.id,
      memberId: 1, // 테스트용 ID
      guestId: null
    });
  };

  const resetSelection = () => {
    setSelectedSeats([]);
    setPersonnel({ adult: 0, youth: 0, senior: 0, special: 0 });
  };

  //3)외부 통신

  // 초기 데이터 가져오기 (Axios/Fetch 대체 가능)
  useEffect(() => {
    fetch(`http://localhost:8080/api/screenings/${screeningId}/seats`)
      .then(res => res.json())
      .then((data: SeatStatusDto[]) => {
        const mappedSeats = toSeatViewModels(data);
        setSeats(mappedSeats);
        if (data.length > 0) setScreeningInfo(toScreeningInfoViewModel(data[0]));
        setShowCoupleNotice(mappedSeats.some(s => s.type === "COUPLE"));
      })
      .catch(err => console.error(err));
  }, [screeningId]);

  // 실시간 웹소켓 연결
  useEffect(() => {
    seatService.connect(screeningId, (updatedSeatDto: SeatStatusDto) => {
      // 서버에서 온 DTO를 모델로 바꿔서 상태 업데이트
      setSeats(prev => prev.map(s => s.id === updatedSeatDto.seatId ? toSeatViewModels([updatedSeatDto])[0] : s));
    });
    return () => seatService.disconnect();
  }, [screeningId]);

  //필요한 것들만 밖으로 내보내기
  return {
    seats,
    realSeats,
    entranceSeats,
    screeningInfo,
    selectedSeats,
    personnel,
    totalPersonnelCount,
    isAlertOpen,
    alertMessage,
    showCoupleNotice,
    setIsAlertOpen,
    setShowCoupleNotice,
    handleCountChange,
    toggleSeat,
    resetSelection,
    getPartnerNumber, // 호버 효과를 위해 필요
  };
};