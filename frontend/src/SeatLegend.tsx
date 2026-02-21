import React from "react";
import { StyledSeat } from './Seat.styles';

interface LegendItemProps {
  children: React.ReactNode;
  label: string;
}

const LegendItem = ({ children, label } : LegendItemProps) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    {children}
    <span style={{ fontSize: "13px" }}>{label}</span>
  </div>
);

export const SeatLegend = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <LegendItem label="선택된 좌석">
        <StyledSeat
          $status="AVAILABLE"
          $seatType="NORMAL"
          $isSelected={true}
          $isCoupleInvalid={false}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>

      <LegendItem label="예매 완료">
        <StyledSeat
          $status="RESERVED"
          $seatType="NORMAL"
          $isSelected={false}
          $isCoupleInvalid={false}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>

      <LegendItem label="선택 불가">
        <StyledSeat
          $status="AVAILABLE"
          $seatType="NORMAL"
          $isSelected={false}
          $isCoupleInvalid={true}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>

      <LegendItem label="일반 좌석">
        <StyledSeat
          $status="AVAILABLE"
          $seatType="NORMAL"
          $isSelected={false}
          $isCoupleInvalid={false}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>

      <LegendItem label="장애인석">
        <StyledSeat
          $status="AVAILABLE"
          $seatType="DISABLED"
          $isSelected={false}
          $isCoupleInvalid={false}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>

      <LegendItem label="커플석">
        <StyledSeat
          $status="AVAILABLE"
          $seatType="COUPLE"
          $isSelected={false}
          $isCoupleInvalid={false}
          $posX={0}
          $posY={0}
          style={{ position: "relative", pointerEvents: "none" }}
        >
        </StyledSeat>
      </LegendItem>
    </div>
  );
};