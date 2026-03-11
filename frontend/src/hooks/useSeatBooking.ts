/* ===================================
hooks/useSeatBooking에서는
1)데이터보관 및 관리, 
2)규칙(좌석 선택, 커플석), 
3)외부 통신과 같은 기능을 옮겨
pages/SeatBooking의 기능을 분산시킵니다.
=================================== */

import { useMemo, useState, useEffect, useCallback } from "react";
import type { SeatBookingResponseDto, SeatInfoDto } from "../types/dtos/seatBooking.dto";
import type { SeatViewModel, ScreeningInfoViewModel } from "../types/models/SeatBookingViewModel";
import { toSeatViewModels, toScreeningInfoViewModel } from "../mappers/seatBookingMapper";
import { seatSocketService } from "../services/seatSocketService";
import { seatBookingApi } from "../api/seatBookingApi";
import { reservationApi } from "../api/reservationApi";

import { cinemaAlert } from "../utils/alert";

// ✨ AuthContext 가져오기
import { useAuth } from "../contexts/AuthContext";

export const useSeatBooking = (screeningId: number) => {
  // ✨ 로그인 상태 정보 가져오기 (회원번호, 비회원번호 등)
  const { isGuest, memberId, guestId } = useAuth();

  //1) 데이터 보관 및 관리
  const [seats, setSeats] = useState<SeatViewModel[]>([]);
  const [screeningInfo, setScreeningInfo] = useState<ScreeningInfoViewModel | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatViewModel[]>([]);
  const [personnel, setPersonnel] = useState({ adult: 0, youth: 0, senior: 0, special: 0 });
  const [showCoupleNotice, setShowCoupleNotice] = useState(false);

  const totalPersonnelCount = Object.values(personnel).reduce((a, b) => a + b, 0);
  const realSeats = seats.filter((s) => s.isRealSeat);
  const entranceSeats = seats.filter((s) => s.isEntrance);

  //2) 규칙(좌석 선택, 커플석 관리)
  const getPartnerNumber = useCallback((currentSeat: SeatViewModel) => {
    const sameRowSeats = realSeats
        .filter((s) => s.row === currentSeat.row && s.type === currentSeat.type && s.status === 'AVAILABLE')
        .sort((a, b) => a.number - b.number);

    if (sameRowSeats.length === 0) return null;

    const chunks: SeatViewModel[][] = [];
    let currentChunk: SeatViewModel[] = [sameRowSeats[0]];

    for (let i = 1; i < sameRowSeats.length; i++) {
      const prevSeat = currentChunk[currentChunk.length - 1];
      const currSeat = sameRowSeats[i];
      
      const isAdjacent = Math.abs(currSeat.x - prevSeat.x) <= 20 && Math.abs(currSeat.y - prevSeat.y) <= 20;

      if (isAdjacent) {
        currentChunk.push(currSeat);
      } else {
        chunks.push(currentChunk);
        currentChunk = [currSeat];
      }
    }
    chunks.push(currentChunk);

    const myChunk = chunks.find(chunk => chunk.some(s => s.id === currentSeat.id));
    if (!myChunk || myChunk.length < 2) return null;

    const indexInGroup = myChunk.findIndex((s) => s.id === currentSeat.id);
    const groupSize = myChunk.length;

    let partnerIdx: number;
    if (groupSize % 2 !== 0 && indexInGroup >= groupSize - 2) {
        partnerIdx = (indexInGroup === groupSize - 1) ? indexInGroup - 1 : indexInGroup + 1;
    } else {
        partnerIdx = (indexInGroup % 2 === 0) ? indexInGroup + 1 : indexInGroup - 1;
    }

    return myChunk[partnerIdx] ? Number(myChunk[partnerIdx].number) : null;
  }, [realSeats]);

  const handleCountChange = (type: keyof typeof personnel, delta: number) => {
    const nextCount = personnel[type] + delta;
    if (nextCount < 0) return;
    
    if (delta > 0 && totalPersonnelCount >= 8) {
      cinemaAlert("최대 8명까지만 선택 가능합니다.","알람");
      return;
    }
    if (delta < 0 && selectedSeats.length > (totalPersonnelCount - 1)) {
      cinemaAlert("선택된 좌석보다 인원수가 적을 수 없습니다.","알람");
      return;
    }
    setPersonnel({ ...personnel, [type]: nextCount });
  };

  const toggleSeat = (seat: SeatViewModel) => {
    if (totalPersonnelCount === 0) {
      cinemaAlert("관람하실 인원을 먼저 선택해주세요.","알람");
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    const remainingCount = totalPersonnelCount - selectedSeats.length;

    // [취소 로직]
    if (isAlreadySelected) {
      const partnerNum = Number(getPartnerNumber(seat));
      const partnerSeat = realSeats.find(
        (s) => s.row === seat.row && s.number === partnerNum && s.type === seat.type
      );

      setSelectedSeats((prev) => {
        const isPartnerSelected = partnerSeat && prev.some((s) => s.id === partnerSeat.id);
        if (isPartnerSelected) {
          return prev.filter((s) => s.id !== seat.id && s.id !== partnerSeat?.id);
        }
        return prev.filter((s) => s.id !== seat.id);
      });
      return;
    }

    // [선택 로직]
    if (remainingCount <= 0) {
      cinemaAlert("이미 모든 좌석을 선택하셨습니다.","알림");
      return;
    }

    if (remainingCount >= 2) {
      const partnerNum = getPartnerNumber(seat);
      const partnerSeat = realSeats.find(s => s.row === seat.row && s.number === partnerNum && s.type === seat.type);
      const isPartnerAlreadySelected = selectedSeats.some(s => s.id === partnerSeat?.id);

      if (partnerSeat && partnerSeat.status !== "RESERVED" && !isPartnerAlreadySelected) {
        setSelectedSeats([...selectedSeats, seat, partnerSeat]);
        return;
      }
    }

    if (remainingCount === 1) {
      const availableSameTypeSeats = realSeats
        .filter(s => s.row === seat.row && s.type === seat.type && s.status === 'AVAILABLE')
        .filter(s => !selectedSeats.some(sel => sel.id === s.id))
        .sort((a, b) => a.number - b.number);

      if (availableSameTypeSeats.length > 0) {
        const chunks: SeatViewModel[][] = [];
        let currentChunk = [availableSameTypeSeats[0]];

        for (let i = 1; i < availableSameTypeSeats.length; i++) {
          const prevSeat = currentChunk[currentChunk.length - 1];
          const currSeat = availableSameTypeSeats[i];
          const isAdjacent = Math.abs(currSeat.x - prevSeat.x) <= 20 && Math.abs(currSeat.y - prevSeat.y) <= 20;

          if (isAdjacent) {
            currentChunk.push(currSeat);
          } else {
            chunks.push(currentChunk);
            currentChunk = [currSeat];
          }
        }
        chunks.push(currentChunk);

        const myChunk = chunks.find(chunk => chunk.some(s => s.id === seat.id));
        
        if (myChunk) {
          const indexInGroup = myChunk.findIndex(s => s.id === seat.id);
          if (indexInGroup % 2 !== 0) {
            cinemaAlert("해당 좌석은 단독으로 선택할 수 없습니다.","알림");
            return;
          }
        }
      }
    }
    
    setSelectedSeats([...selectedSeats, seat]);
  };

  const resetSelection = () => {
    setSelectedSeats([]);
    setPersonnel({ adult: 0, youth: 0, senior: 0, special: 0 });
  };

  // 결제 금액 계산
  const totalPrice = useMemo(() => {
    if (!screeningInfo || !screeningInfo.prices) return 0;
    
    return (
      (personnel.adult * screeningInfo.prices.adult) +
      (personnel.youth * screeningInfo.prices.youth) +
      (personnel.senior * screeningInfo.prices.senior) +
      (personnel.special * screeningInfo.prices.special)
    );
  }, [personnel, screeningInfo]);

  const getFormattedTickets = useCallback(() => {
    const sortedSeats = [...selectedSeats].sort((a, b) => {
      if (a.type === "DISABLED" && b.type !== "DISABLED") return -1;
      return a.type !== "DISABLED" && b.type === "DISABLED" ? 1 : 0;
    });

    const priceTypes = [
      ...Array(personnel.special).fill("SPECIAL"),
      ...Array(personnel.adult).fill("ADULT"),
      ...Array(personnel.youth).fill("YOUTH"),
      ...Array(personnel.senior).fill("SENIOR"),
    ];

    return sortedSeats.map((seat, index) => ({
      seatId: seat.id,
      priceType: priceTypes[index] || "ADULT"
    }));
  }, [selectedSeats, personnel]);

  // 💡 메인 로직: 결제 프로세스 시작
  // 매개변수에서 memberId를 빼고, 훅 안에서 꺼낸 값을 바로 씁니다.
  const handleProceedToPayment = async (navigate: any) => {
    if (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount) {
      cinemaAlert("인원수에 맞게 좌석을 선택해주세요.","알림");
      return;
    }

    if (!isGuest && !memberId) {
      cinemaAlert("로그인 정보가 없습니다. 다시 로그인해 주세요.","알림");
      return;
    }

    if (isGuest && !guestId) {
      cinemaAlert("비회원 인증 정보가 없습니다. 비회원 로그인 후 다시 시도해 주세요.","알림");
      return;
    }

    try {
      const tickets = getFormattedTickets();
      
      let safeGuestId = null;
      if (isGuest && guestId) {
        safeGuestId = Number(String(guestId).replace(/\D/g, '')); 
      } //숫자가 아닌 모든 문자(GUEST_ 등)를 제거

      const data = await reservationApi.holdSeats({
        screeningId,
        memberId: isGuest ? null : memberId,
        guestId: safeGuestId,
        tickets
      });

      if (data.reservationId) {
        navigate(`/payment?reservationId=${data.reservationId}`);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "좌석 선점에 실패했습니다.";
      cinemaAlert(message,"알림");
    }
  };

  //3) 외부 통신

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response: SeatBookingResponseDto = await seatBookingApi.getScreeningSeats(screeningId); 
        
        const mappedSeats = toSeatViewModels(response.seats);
        setSeats(mappedSeats);
        
        if (response.screeningInfo) {
          setScreeningInfo(toScreeningInfoViewModel(response.screeningInfo));
        }

        setShowCoupleNotice(mappedSeats.some(s => s.type === "COUPLE"));
      } catch (err) {
        cinemaAlert("데이터를 불러오는 중 오류가 발생했습니다.", "알림");
      }
    };

    loadInitialData();
  }, [screeningId]);

  useEffect(() => {
    seatSocketService.connect(screeningId, (updatedSeats: SeatInfoDto[]) => {
      setSeats(prevSeats => {
        return prevSeats.map(seat => {
          const newData = updatedSeats.find(updated => updated.seatId === seat.id);
          if (newData) {
            return {
              ...seat,
              status: newData.status,
            };
          }
          return seat;
        });
      });
    });

    return () => {
      seatSocketService.disconnect();
    };
  }, [screeningId]);

  return {
    seats,
    realSeats,
    entranceSeats,
    screeningInfo,
    selectedSeats,
    personnel,
    totalPersonnelCount,
    showCoupleNotice,
    totalPrice,
    setShowCoupleNotice,
    handleCountChange,
    toggleSeat,
    resetSelection,
    getPartnerNumber,
    handleProceedToPayment
  };
};
