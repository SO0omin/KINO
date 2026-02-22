/* ===================================
hooks/useSeatBooking에서는
1)데이터보관 및 관리, 
2)규칙(좌석 선택, 커플석), 
3)외부 통신과 같은 기능을 옮겨
pages/SeatBooking의 기능을 분산시킵니다.
=================================== */

import { useMemo, useState, useEffect, useCallback } from "react";
import type { SeatBookingResponseDto, SeatInfoDto } from "../types/dtos/SeatBookingResponseDto";
import type { SeatViewModel, ScreeningInfoViewModel } from "../types/models/SeatBookingViewModel";
import { toSeatViewModels, toScreeningInfoViewModel } from "../mappers/seatBookingMapper";
import { seatService } from "../services/seatSocketService";
import { seatBookingApi } from "../api/seatBookingApi";
import { useAuth } from '../contexts/AuthContext';

export const useSeatBooking = (screeningId: number) => {
  //1) 데이터 보관 및 관리
  const [seats, setSeats] = useState<SeatViewModel[]>([]);
  const [screeningInfo, setScreeningInfo] = useState<ScreeningInfoViewModel | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatViewModel[]>([]);
  const [personnel, setPersonnel] = useState({ adult: 0, youth: 0, senior: 0, special: 0 });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showCoupleNotice, setShowCoupleNotice] = useState(false);
  const { isLoggedIn, memberId } = useAuth();

  const totalPersonnelCount = Object.values(personnel).reduce((a, b) => a + b, 0);
  const realSeats = seats.filter((s) => s.isRealSeat);
  const entranceSeats = seats.filter((s) => s.isEntrance);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertOpen(true);
  };

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
      showAlert("최대 8명까지만 선택 가능합니다.");
      return;
    }
    if (delta < 0 && selectedSeats.length > (totalPersonnelCount - 1)) {
      showAlert("선택된 좌석보다 인원수가 적을 수 없습니다.");
      return;
    }
    setPersonnel({ ...personnel, [type]: nextCount });
  };

  const toggleSeat = (seat: SeatViewModel) => {
    if (totalPersonnelCount === 0) {
      showAlert("관람하실 인원을 먼저 선택해주세요.");
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    const remainingCount = totalPersonnelCount - selectedSeats.length;

    // 💡 완벽하게 복구된 [취소 로직] - ID 기반 필터링
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
      showAlert("이미 모든 좌석을 선택하셨습니다.");
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
            showAlert("해당 좌석은 단독으로 선택할 수 없습니다.");
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

  //3) 외부 통신

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // API에서 객체({ screeningInfo, seats })를 받아옵니다.
        const response: SeatBookingResponseDto = await seatBookingApi.getScreeningSeats(screeningId); 
        
        const mappedSeats = toSeatViewModels(response.seats);
        setSeats(mappedSeats);
        
        if (response.screeningInfo) {
          setScreeningInfo(toScreeningInfoViewModel(response.screeningInfo));
        }

        setShowCoupleNotice(mappedSeats.some(s => s.type === "COUPLE"));
      } catch (err) {
        console.error("좌석 로딩 에러:", err);
        setAlertMessage("데이터를 불러오는 중 오류가 발생했습니다.");
        setIsAlertOpen(true);
      }
    };

    loadInitialData();
  }, [screeningId]);

  useEffect(() => {
    // 💡 콜백 타입을 최상단에서 선언한 SeatInfoDto[] 로 사용합니다.
    seatService.connect(screeningId, (updatedSeats: SeatInfoDto[]) => {
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
      seatService.disconnect();
    };
  }, [screeningId]);

  const handleReservation = () => {
    if (selectedSeats.length === 0) return;

    //비회원 예매차단
    if (!isLoggedIn || !memberId) {
      alert("회원 예매만 가능합니다. 로그인해주세요.");
      return;
    }

    seatService.holdSeat({
      screeningId,
      seatIds: selectedSeats.map(s => s.id),
      memberId: memberId,
      guestId: null
    });
  };

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
    totalPrice,
    setIsAlertOpen,
    setShowCoupleNotice,
    handleCountChange,
    toggleSeat,
    resetSelection,
    getPartnerNumber,
    handleReservation
  };
};