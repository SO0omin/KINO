import styled, { css } from "styled-components";

interface SeatProps {
  $status: string;
  $seatType: string;
  $isSelected: boolean;
  $isCoupleInvalid: boolean;
  $posX: number;
  $posY: number;
}

export const StyledSeat = styled.button<SeatProps>`
  position: absolute;
  left: ${(props) => props.$posX}px;
  top: ${(props) => props.$posY}px;
  width: 20px;  /* 요청하신 20px 고정 */
  height: 20px;
  font-size: 9px; /* 크기에 맞춰 폰트 소폭 축소 */
  border: 1px solid #999;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  padding: 0;
  transition: all 0.15s ease-in-out;

  /* --- 기본 배경 및 상태별 로직 --- */
  ${(props) => {
    const isLocked = props.$status === "RESERVED" || props.$isCoupleInvalid || props.$status === "HELD";
    if (isLocked) {
      return css`
        background-color: #e0e0e0;
        color: #fff;
        cursor: not-allowed;
        pointer-events: none; /* 중요: 마우스 호버/클릭 이벤트를 아예 무시함 */
      `;
    }
    if (props.$isSelected) {
      return css`
        background-color: #8e44ad;
        color: #fff;
        border-color: #732d91;
      `;
    }
    switch (props.$seatType) {
      case "DISABLED": return css`background-color: #8ee0b0;`;
      case "COUPLE": return css`background-color: #f5a8cb;`;
      default: return css`background-color: #d1d1d1;`;
    }
  }}

  /* --- 20px 전용 디테일 조정 --- */

  /* 1. 선택 시 오른쪽 위 하얀 삼각형 (크기 축소: 8px -> 6px) */
  ${(props) => props.$isSelected && css`
    &::after {
      content: "";
      position: absolute;
      top: 0; right: 0;
      border-style: solid;
      border-width: 0 6px 6px 0; 
      border-color: transparent #ffffff transparent transparent;
    }
  `}

  /* 2. 장애인/커플석 밑 중간 작은 하얀 세모 (크기 축소: 5px -> 4px) */
  ${(props) => props.$status === "AVAILABLE" && !props.$isSelected && !props.$isCoupleInvalid && props.$seatType === "DISABLED" && css`
    &::before {
      content: "";
      position: absolute;
      bottom: 1px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-bottom: 4px solid #ffffff;
    }
  `}

    ${(props) => props.$status === "AVAILABLE" && !props.$isSelected && !props.$isCoupleInvalid && props.$seatType === "COUPLE"&& css`
    &::before {
      content: "";
      position: absolute;
      top: 1px;                 /* bottom → top */
      left: 50%;
      transform: translateX(-50%);
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-top: 4px solid #ffffff;  /* 방향 핵심 */
    }
  `}


  /* 3. 예매 완료 시 꽉 찬 X */
  ${(props) => (props.$status === "RESERVED" || props.$status === "HELD") && css`
    &::before, &::after {
      content: "";
      position: absolute;
      width: 1px;
      height: 100%;
      background-color: #999;
    }
    &::before { transform: rotate(45deg); }
    &::after { transform: rotate(-45deg); }
  `}

  /* 4. 선택 불가 시 모서리 대각선 (위치 조정) */
  ${(props) => props.$isCoupleInvalid && css`
    &::before {
      content: "";
      position: absolute;
      top: 0px;
      right: -3px;
      width: 9px;   /* 선 길이를 조금 늘림 */
      height: 2px;
      background-color: #ffffffff;
      transform: rotate(-45deg); /* 방향을 우상단으로 */
    }
    &::after {
      content: "";
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 6px;
      height: 1.5px;
      background-color: #ffffffff;
      transform: rotate(-45deg); /* 방향을 좌하단으로 */
    }
  `}
  &:hover {
      ${(props) => !props.$isSelected && css`
        filter: brightness(0.9);
        border-color: #732d91;
      `}
    }
`;