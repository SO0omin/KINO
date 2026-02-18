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
import { seatService } from "../services/seatSocketService";
import { seatBookingApi } from "../api/seatBookingApi";

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
    // 1. 같은 줄, 같은 타입 좌석 중 '아직 선택되지 않은' 좌석 필터링 및 정렬
    const availableSameTypeSeats = realSeats
        .filter((s) => s.row === currentSeat.row && s.type === currentSeat.type && s.status === 'AVAILABLE')
        .filter((s) => !selectedSeats.some(sel => sel.id === s.id) || s.id === currentSeat.id)
        .sort((a, b) => a.number - b.number);

    if (availableSameTypeSeats.length === 0) return null;

    // 2. 물리적으로 붙어있는 좌석들끼리 묶음(Chunk) 만들기 (x, y 20 이하 차이)
    const chunks: SeatViewModel[][] = [];
    let currentChunk: SeatViewModel[] = [availableSameTypeSeats[0]];

    for (let i = 1; i < availableSameTypeSeats.length; i++) {
      const prevSeat = currentChunk[currentChunk.length - 1];
      const currSeat = availableSameTypeSeats[i];
      
      // x, y 좌표 차이가 모두 20 이하인지 확인 (절댓값 사용)
      const isAdjacent = Math.abs(currSeat.x - prevSeat.x) <= 20 && Math.abs(currSeat.y - prevSeat.y) <= 20;

      if (isAdjacent) {
        currentChunk.push(currSeat); // 옆자리라면 같은 그룹에 추가
      } else {
        chunks.push(currentChunk); // 옆자리가 아니라면 기존 그룹 저장
        currentChunk = [currSeat]; // 새로운 그룹 시작
      }
    }
    chunks.push(currentChunk); // 마지막 그룹 저장

    // 3. 내가 마우스를 올린(또는 클릭한) 좌석이 속한 묶음(Chunk) 찾기
    const myChunk = chunks.find(chunk => chunk.some(s => s.id === currentSeat.id));
    
    // 묶음이 없거나, 묶음 내 좌석이 혼자라면 파트너 없음
    if (!myChunk || myChunk.length < 2) return null;

    // 4. 해당 묶음 내에서 기존 홀/짝 파트너 로직 실행
    const indexInGroup = myChunk.findIndex((s) => s.id === currentSeat.id);
    const groupSize = myChunk.length;

    let partnerIdx: number;
    
    // 남은 그룹이 홀수개일 때 마지막 처리 (예: 5,6,7 남았을 때 (56)(67)로 묶이는 로직)
    if (groupSize % 2 !== 0 && indexInGroup >= groupSize - 2) {
        partnerIdx = (indexInGroup === groupSize - 1) ? indexInGroup - 1 : indexInGroup + 1;
    } else {
        partnerIdx = (indexInGroup % 2 === 0) ? indexInGroup + 1 : indexInGroup - 1;
    }

    return myChunk[partnerIdx]?.number || null;
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

    // [선택 로직] 중 1명 남았을 때 단일 선택 제한 체크 부분 교체
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
          
          // 홀수 인덱스(1, 3, 5...)를 클릭하려고 하면 차단
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

  //3)외부 통신

  // 초기 데이터 가져오기 (Axios/Fetch 대체 가능)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // API 레이어 사용
        const data = await seatBookingApi.getScreeningSeats(screeningId); 
        
        const mappedSeats = toSeatViewModels(data);
        setSeats(mappedSeats);
        
        if (data.length > 0) {
          setScreeningInfo(toScreeningInfoViewModel(data[0]));
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

  // 실시간 웹소켓 연결
  useEffect(() => {
    seatService.connect(screeningId, (updatedSeats: SeatStatusDto[]) => {
      
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
    //console.log("포착: 예약하기 버튼 클릭됨!");
    if (selectedSeats.length === 0) return;

    // 최종 선택된 좌석 ID 리스트를 서버로 전송
    seatService.holdSeat({
      screeningId,
      seatIds: selectedSeats.map(s => s.id),
      memberId: 1, // 실제 환경에선 세션/컨텍스트에서 가져온 유저 ID
      guestId: null
    });

    console.log("🚀 [최종 예약 전송]:", selectedSeats.map(s => s.id));
    
    // 이후 페이지 이동 로직 등이 필요하다면 여기서 처리하거나 
    // 성공 응답을 받은 후 처리하도록 설계합니다.
  };

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
    handleReservation
  };
};