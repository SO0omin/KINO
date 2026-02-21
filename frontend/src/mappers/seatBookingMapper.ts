import type { SeatStatusDto } from "../types/dtos/SeatStatusDto";
import type { SeatViewModel, ScreeningInfoViewModel } from "../types/models/SeatBookingViewModel";
import entranceImg from "../assets/entrance.png";
import exitImg from "../assets/exit.png";
import entranceExitAllImg from "../assets/entrance_exit_all.png";

// 좌석 리스트 변환
export const toSeatViewModels = (dtos: SeatStatusDto[]): SeatViewModel[] => {

  return dtos.map(dto => {
    let icon = entranceExitAllImg;
    let label = "입/출구";
    const isEntranceType = ["ENTRANCE", "EXIT", "ETRANCE_EXIT_ALL"].includes(dto.seatType);

    if (dto.seatType === "ENTRANCE") {
      icon = entranceImg; label = "입구";
    } else if (dto.seatType === "EXIT") {
      icon = exitImg; label = "출구";
    }

    return {
      id: dto.seatId,
      row: dto.seatRow,
      number: dto.seatNumber,
      label: `${dto.seatRow}${dto.seatNumber}`,
      status: dto.status,
      type: dto.seatType,
      x: dto.posX,
      y: dto.posY,
      isRealSeat: dto.seatRow !== "0", // 실제 좌석만 필터링을 위해 필요, 입/출구의 경우, seatRow와 seatNumber이 각각 무조건 "0"과 0으로 설정됨
      isEntrance: isEntranceType,
      displayIcon: icon,
      displayLabel: label
    };
  });
};

// 상영 정보 변환 -> 좌석 정보와 함께 올 상영과, 영화관, 시간 관련 정보는 전부 같기 때문에 리스트 중 첫 번째 요소만 사용
export const toScreeningInfoViewModel = (dto: SeatStatusDto): ScreeningInfoViewModel => {
  return {
    movie: {
      title: dto.movieTitle,
      poster: dto.posterUrl,
      ageRating: dto.ageRating
    },
    theater: {
      name: dto.theaterName,
      screenName: dto.screenName,
      screenType: dto.screenType
    },
    time: {
      start: dto.startTime,
      end: dto.endTime
    }
  };
};