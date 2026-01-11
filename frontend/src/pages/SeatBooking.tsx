import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

// 우리가 만든 훅과 유틸들
import { useSeatBooking } from "../hooks/useSeatBooking";
import { formatDate, formatTime } from '../utils/dateFormatter';
import ratingImages from '../utils/getRatingImage';

// 스타일 및 컴포넌트
import { StyledSeat } from '../Seat.styles';
import { SeatLegend } from "../SeatLegend";
import { CommonModal } from "../CommonModal";

// 이미지 에셋
import screenImg from "../assets/screen.png";

const SeatBooking = () => {
  const screeningId = 8; 
  const {
    //seats,
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
    getPartnerNumber
  } = useSeatBooking(screeningId);

  // UI 전용 상태 -> 호버처럼 UI와 관련이 밀접한 상태의 경우 굳이 따로 분리하지 않아도 됩니다.
  const [hoveredSeatId, setHoveredSeatId] = useState<number | null>(null);
  return (
    <div style={{ padding: "20px", color: "#000" }}>
      <span style={{ fontSize: "30px", fontWeight: "bold" }}>빠른예매</span>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        {/* 좌석 화면 영역 */}
        <div style={{ flex: 2 }}>
          <hr />
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <span>관람인원선택</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={resetSelection} style={{ cursor: "pointer" }}>
                <FontAwesomeIcon icon={faArrowsRotate} /> 초기화
              </button>
            </div>
          </div>
          {/* 관람선택 박스 */}
          <div style={{
            position: "relative",
            width: "600px",
            height: "500px",
            border: "1px solid #e8e8e8ff",
            overflow: "hidden"
          }}>
            <div style={{
              width: "580px",
              height: "40px",
              backgroundColor: "#e8e8e8ff",
              justifyContent:"space-between",
              marginBottom: "45px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "0 10px",
              fontSize: "12px",
              color: "#333"
            }}>
              {(['adult', 'youth', 'senior', 'special'] as const).map((type) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span>{type === 'adult' ? '성인' : type === 'youth' ? '청소년' : type === 'senior' ? '경로' : '우대'}</span>
                  <button onClick={() => handleCountChange(type, -1)}>-</button>
                  <span style={{ width: "20px", textAlign: "center", backgroundColor: "#fff", border: "1px solid #ccc" }}>
                    {personnel[type]}
                  </span>
                  <button onClick={() => handleCountChange(type, 1)}>+</button>
                </div>
              ))}
            </div>
            {/* 스크린 이미지 */}
            <img src={screenImg} alt="screen" style={{ display: "block", width: "100%"}} />

            {/* 커플석 알림창 */}
            {showCoupleNotice && (
              <div style={{
                position: "absolute",
                top: "42px",          
                left: "50%",          
                transform: "translateX(-50%)", 
                backgroundColor: "rgba(255, 243, 248)",
                border: "1px solid #f5a8cb",
                padding: "4px 15px",
                width:"560px",
                borderRadius: "20px", 
                zIndex: 10,           
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "12px",
                color: "#d63384",
                whiteSpace: "nowrap",  // 한 줄로 유지
                justifyContent:"space-between"
              }}>
                <span><strong>[알림]</strong> 커플석은 2, 4, 6, 8명일 경우 선택하실 수 있습니다.</span>
                <button 
                  onClick={() => setShowCoupleNotice(false)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#d63384",
                    fontWeight: "bold",
                    padding: "0 2px"
                  }}
                >✕</button>
              </div>
            )}


            {/* 메인 컨테이너 (행이름 + 좌석 + 출입구) */}
            <div id="seat-container" style={{
              position: "absolute",
              top: "145px",
              left: "42%",
              transform: "translateX(-50%)",
            }}>
              
              {/* 행 이름 렌더링 */}
              {[...new Set(realSeats.map(s => s.row))].sort().map((row) => {
                const firstSeatInRow = realSeats.find(s => s.row === row);
                const posY = firstSeatInRow ? firstSeatInRow.y : 0;
                return (
                  <div key={`row-${row}`} style={{
                    position: "absolute", left: "-40px", top: `${posY}px`,
                    width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: "bold"
                  }}>{row}</div>
                );
              })}

              {/* 실제 좌석 렌더링 */}
              {realSeats.map((seat) => {
                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                const remainingCount = totalPersonnelCount - selectedSeats.length;

                // 1. 현재 호버된 좌석 데이터 기반 파트너 찾기
                const hoveredSeat = realSeats.find(s => s.id === hoveredSeatId);
                const partnerNumber = (hoveredSeat && !selectedSeats.some(s => s.id === hoveredSeat.id)) 
                  ? getPartnerNumber(hoveredSeat) 
                  : null;
                
                // 2. 호버 스타일 결정
                const isHovered = totalPersonnelCount > 0 && hoveredSeatId === seat.id;
                const isPartnerAlreadySelected = selectedSeats.some(s => 
                  s.row === hoveredSeat?.row && s.number === partnerNumber && s.type === hoveredSeat?.type
                );

                const isSideHovered = 
                  totalPersonnelCount > 0 &&
                  (totalPersonnelCount - selectedSeats.length) >= 2 && 
                  partnerNumber !== null && // 파트너 번호가 확실히 있을 때만
                  partnerNumber === seat.number &&
                  hoveredSeat?.row === seat.row &&
                  hoveredSeat?.type === seat.type &&
                  !isPartnerAlreadySelected;

                // 3. 시각적 무효 상태(대각선) 결정
                let isVisualInvalid = false;
                if (totalPersonnelCount > 0 && !isSelected) {
                  // [규칙 1] 커플석: 홀수 인원일 때 무효
                  if (seat.type === "COUPLE" && totalPersonnelCount % 2 !== 0) {
                    isVisualInvalid = true;
                  } 
                  // [규칙 2] 1인 남았을 때 체크 (인덱스 기반)
                  else if (remainingCount === 1) {
                    const sameTypeSeats = realSeats
                      .filter(s => s.row === seat.row && s.type === seat.type)
                      .sort((a, b) => a.number - b.number);
                    
                    const indexInGroup = sameTypeSeats.findIndex(s => s.id === seat.id);
                    const groupSize = sameTypeSeats.length;

                    const isLastElement = indexInGroup === groupSize - 1;
                    const isOddIndex = indexInGroup % 2 !== 0;

                    // 홀수 인덱스(2, 4, 6, 8번째) 자리에 대각선 표시
                    // 단, 전체가 홀수개일 때 마지막 자리(예: 9번)는 제외
                    if (isOddIndex && !(groupSize % 2 !== 0 && isLastElement)) {
                      isVisualInvalid = true;
                    }
                  }
                }

                return (
                  <StyledSeat
                    key={seat.id}
                    $status={seat.status}
                    $seatType={seat.type}
                    $isSelected={isSelected || isHovered || isSideHovered}
                    $isCoupleInvalid={isVisualInvalid}
                    $posX={seat.x}
                    $posY={seat.y}
                    onMouseEnter={() => setHoveredSeatId(seat.id)}
                    onMouseLeave={() => setHoveredSeatId(null)}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.status === "RESERVED"}
                  >
                    {seat.status === "RESERVED" || seat.status === "HELD" ? null : seat.number}
                  </StyledSeat>
                );
              })}

              {/* 출입구 렌더링 */}
              {entranceSeats.map((seat) => (
                <div key={seat.id} style={{
                  position: "absolute", 
                  left: `${seat.x}px`, 
                  top: `${seat.y}px`,
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center"
                }}>
                  <img 
                    src={seat.displayIcon} // 매퍼에서 이미 결정된 아이콘
                    alt={seat.displayLabel} // 매퍼에서 이미 결정된 라벨
                    style={{ width: "16px", height: "16px" }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 정보창 (기존 코드 유지 및 스타일 소폭 수정) */}
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#1f1f1f", color: "#fff", borderRadius: "10px", minWidth: "350px" }}>
          {screeningInfo ? (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <img src={ratingImages[screeningInfo.movie.ageRating as keyof typeof ratingImages]} alt="등급" style={{ width: "25px", height: "25px" }} />
                <div>
                  <h3 style={{ margin: 0 }}>{screeningInfo.movie.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#aaa" }}>{screeningInfo.theater.screenType}</p>
                </div>
              </div>
              <hr style={{ borderColor: "#444" }} />
              <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0" }}>
                <div>
                  <p style={{ margin: "5px 0" }}>{screeningInfo.theater.name} / {screeningInfo.theater.screenName}</p>
                  <p style={{ margin: "5px 0", fontWeight: "bold" }}>{formatDate(screeningInfo.time.start)}</p>
                  <p style={{ margin: "5px 0" }}>{formatTime(screeningInfo.time.start)} ~ {formatTime(screeningInfo.time.end)}</p>
                </div>
                <img src={screeningInfo.movie.poster} alt="poster" style={{ width: "70px", borderRadius: "5px" }} />
              </div>
            </>
          ) : <p>데이터 로딩 중...</p>}
          <hr style={{ borderColor: "#444" }} />
          <div style={{ display: "flex", 
                        border:"1px solid gray",
                        }}>
            {/* 좌석 영역 */}
            <div style={{ flex: 1, padding:"10px"}}>
              <SeatLegend />
            </div>

            {/* 중간 구분선 (추가됨) */}
            <div style={{ 
              width: "1px", 
              backgroundColor: "#ccc",
              margin:"0px"
            }} />

            {/* 우측 정보 영역 */}
            <div style={{ flex: 1,display:"flex",alignItems: "center",flexDirection:"column",padding:"10px"}}>
              <div style={{ fontWeight: "bold", marginBottom: "10px"}}>선택좌석</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 40px)", // 2칸
                  gap: "6px 8px", // 세로 / 가로 간격
                }}
              >
                {Array.from({ length: 8 }).map((_, index) => {
                  const seat = selectedSeats[index];

                  return (
                    <div
                      key={index}
                      style={{
                        width: "40px",
                        height: "28px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: seat ? "#8e44ad" : "transparent",
                        color: seat ? "#fff" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: seat ? "bold" : "normal",
                      }}
                    >
                      {seat ? `${seat.row}${seat.number}` : "-"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <h3>최종결제금액: <span style={{ color: "#5fdfffff" }}>{(selectedSeats.length * 12000).toLocaleString()}</span>원</h3>

          <button
            disabled={selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount}
            style={{
              width: "100%", padding: "15px", 
              backgroundColor: (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount) ? "#555" : "#e74c3c",
              color: "#fff", border: "none", borderRadius: "5px", fontSize: "18px", fontWeight: "bold",
              cursor: (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount) ? "not-allowed" : "pointer"
            }}
          >
            {selectedSeats.length === 0 
              ? "인원과 좌석을 선택하세요" 
              : selectedSeats.length !== totalPersonnelCount 
                ? `${totalPersonnelCount - selectedSeats.length}석을 더 선택하세요` 
                : "예약하기"}
          </button>
        </div>
      </div>
      {/* 공통 모달 배치 */}
      <CommonModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <h3 style={{ margin: 0, color: "#333" }}>알림</h3>
        <div style={{ marginTop: "15px", marginBottom: "5px" }}>
          {alertMessage}
        </div>
      </CommonModal>
    </div>
  );
};

export default SeatBooking;