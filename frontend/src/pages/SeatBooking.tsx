// src/pages/SeatBooking.tsx
import { useEffect, useState } from "react";

// 1️⃣ 타입 정의
type Seat = {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  status: "AVAILABLE" | "RESERVED";
  posX: number; // 좌석 X 좌표 (px)
  posY: number; // 좌석 Y 좌표 (px)
};

const SeatBooking = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // 2️⃣ API 호출
  useEffect(() => {
    fetch("/api/seats") // 실제 API 엔드포인트
      .then((res) => res.json())
      .then((data: Seat[]) => setSeats(data))
      .catch((err) => console.error(err));
  }, []);

  // 3️⃣ 좌석 선택/해제
  const toggleSeat = (seat: Seat) => {
    if (seat.status === "RESERVED") return;
    if (selectedSeats.some(s => s.seatId === seat.seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>좌석 예매</h1>

      {/* 4️⃣ 좌석 컨테이너 */}
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "400px",
          border: "1px solid black",
          margin: "0 auto",
          backgroundColor: "#f8f8f8",
        }}
      >
        {seats.map((seat) => {
          const selected = selectedSeats.some(s => s.seatId === seat.seatId);

          return (
            <button
              key={seat.seatId}
              onClick={() => toggleSeat(seat)}
              disabled={seat.status === "RESERVED"}
              style={{
                position: "absolute",
                left: `${seat.posX}px`,
                top: `${seat.posY}px`,
                width: "40px",
                height: "40px",
                backgroundColor: seat.status === "RESERVED" ? "gray" : selected ? "green" : "white",
                border: "1px solid black",
                cursor: seat.status === "RESERVED" ? "not-allowed" : "pointer",
              }}
            >
              {seat.seatRow}-{seat.seatNumber}
            </button>
          );
        })}
      </div>

      {/* 선택 좌석 표시 */}
      <div style={{ marginTop: "20px" }}>
        <h2>선택된 좌석:</h2>
        {selectedSeats.length === 0
          ? "없음"
          : selectedSeats.map((s) => `${s.seatRow}-${s.seatNumber}`).join(", ")}
      </div>
    </div>
  );
};

export default SeatBooking;