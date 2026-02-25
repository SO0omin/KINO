import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    realSeats, entranceSeats, screeningInfo, selectedSeats, personnel, totalPersonnelCount, isAlertOpen, alertMessage, showCoupleNotice, setIsAlertOpen, setShowCoupleNotice, handleCountChange, toggleSeat, resetSelection, getPartnerNumber } = useSeatBooking(screeningId);
    // UI 전용 상태 -> 호버처럼 UI와 관련이 밀접한 상태의 경우 굳이 따로 분리하지 않아도 됩니다.
    const [hoveredSeatId, setHoveredSeatId] = useState(null);
    return (_jsxs("div", { style: { padding: "20px", color: "#000" }, children: [_jsx("span", { style: { fontSize: "30px", fontWeight: "bold" }, children: "\uBE60\uB978\uC608\uB9E4" }), _jsxs("div", { style: { display: "flex", gap: "20px", marginTop: "20px" }, children: [_jsxs("div", { style: { flex: 2 }, children: [_jsx("hr", {}), _jsxs("div", { style: { display: "flex", alignItems: "center", marginBottom: "10px" }, children: [_jsx("span", { children: "\uAD00\uB78C\uC778\uC6D0\uC120\uD0DD" }), _jsx("div", { style: { marginLeft: "auto" }, children: _jsxs("button", { onClick: resetSelection, style: { cursor: "pointer" }, children: [_jsx(FontAwesomeIcon, { icon: faArrowsRotate }), " \uCD08\uAE30\uD654"] }) })] }), _jsxs("div", { style: {
                                    position: "relative",
                                    width: "600px",
                                    height: "500px",
                                    border: "1px solid #e8e8e8ff",
                                    overflow: "hidden"
                                }, children: [_jsx("div", { style: {
                                            width: "580px",
                                            height: "40px",
                                            backgroundColor: "#e8e8e8ff",
                                            justifyContent: "space-between",
                                            marginBottom: "45px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "0 10px",
                                            fontSize: "12px",
                                            color: "#333"
                                        }, children: ['adult', 'youth', 'senior', 'special'].map((type) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "5px" }, children: [_jsx("span", { children: type === 'adult' ? '성인' : type === 'youth' ? '청소년' : type === 'senior' ? '경로' : '우대' }), _jsx("button", { onClick: () => handleCountChange(type, -1), children: "-" }), _jsx("span", { style: { width: "20px", textAlign: "center", backgroundColor: "#fff", border: "1px solid #ccc" }, children: personnel[type] }), _jsx("button", { onClick: () => handleCountChange(type, 1), children: "+" })] }, type))) }), _jsx("img", { src: screenImg, alt: "screen", style: { display: "block", width: "100%" } }), showCoupleNotice && (_jsxs("div", { style: {
                                            position: "absolute",
                                            top: "42px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 243, 248)",
                                            border: "1px solid #f5a8cb",
                                            padding: "4px 15px",
                                            width: "560px",
                                            borderRadius: "20px",
                                            zIndex: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontSize: "12px",
                                            color: "#d63384",
                                            whiteSpace: "nowrap", // 한 줄로 유지
                                            justifyContent: "space-between"
                                        }, children: [_jsxs("span", { children: [_jsx("strong", { children: "[\uC54C\uB9BC]" }), " \uCEE4\uD50C\uC11D\uC740 2, 4, 6, 8\uBA85\uC77C \uACBD\uC6B0 \uC120\uD0DD\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4."] }), _jsx("button", { onClick: () => setShowCoupleNotice(false), style: {
                                                    border: "none",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    fontSize: "18px",
                                                    color: "#d63384",
                                                    fontWeight: "bold",
                                                    padding: "0 2px"
                                                }, children: "\u2715" })] })), _jsxs("div", { id: "seat-container", style: {
                                            position: "absolute",
                                            top: "145px",
                                            left: "42%",
                                            transform: "translateX(-50%)",
                                        }, children: [[...new Set(realSeats.map(s => s.row))].sort().map((row) => {
                                                const firstSeatInRow = realSeats.find(s => s.row === row);
                                                const posY = firstSeatInRow ? firstSeatInRow.y : 0;
                                                return (_jsx("div", { style: {
                                                        position: "absolute", left: "-40px", top: `${posY}px`,
                                                        width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "12px", fontWeight: "bold"
                                                    }, children: row }, `row-${row}`));
                                            }), realSeats.map((seat) => {
                                                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                                                const remainingCount = totalPersonnelCount - selectedSeats.length;
                                                // 1. 현재 호버된 좌석 데이터 기반 파트너 찾기
                                                const hoveredSeat = realSeats.find(s => s.id === hoveredSeatId);
                                                const partnerNumber = (hoveredSeat && !selectedSeats.some(s => s.id === hoveredSeat.id))
                                                    ? getPartnerNumber(hoveredSeat)
                                                    : null;
                                                // 2. 호버 스타일 결정
                                                const isHovered = totalPersonnelCount > 0 && hoveredSeatId === seat.id;
                                                const isPartnerAlreadySelected = selectedSeats.some(s => s.row === hoveredSeat?.row && s.number === partnerNumber && s.type === hoveredSeat?.type);
                                                const isSideHovered = totalPersonnelCount > 0 &&
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
                                                return (_jsx(StyledSeat, { "$status": seat.status, "$seatType": seat.type, "$isSelected": isSelected || isHovered || isSideHovered, "$isCoupleInvalid": isVisualInvalid, "$posX": seat.x, "$posY": seat.y, onMouseEnter: () => setHoveredSeatId(seat.id), onMouseLeave: () => setHoveredSeatId(null), onClick: () => toggleSeat(seat), disabled: seat.status === "RESERVED", children: seat.status === "RESERVED" || seat.status === "HELD" ? null : seat.number }, seat.id));
                                            }), entranceSeats.map((seat) => (_jsx("div", { style: {
                                                    position: "absolute",
                                                    left: `${seat.x}px`,
                                                    top: `${seat.y}px`,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center"
                                                }, children: _jsx("img", { src: seat.displayIcon, alt: seat.displayLabel, style: { width: "16px", height: "16px" } }) }, seat.id)))] })] })] }), _jsxs("div", { style: { flex: 1, padding: "20px", backgroundColor: "#1f1f1f", color: "#fff", borderRadius: "10px", minWidth: "350px" }, children: [screeningInfo ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", gap: "10px", marginBottom: "15px" }, children: [_jsx("img", { src: ratingImages[screeningInfo.movie.ageRating], alt: "\uB4F1\uAE09", style: { width: "25px", height: "25px" } }), _jsxs("div", { children: [_jsx("h3", { style: { margin: 0 }, children: screeningInfo.movie.title }), _jsx("p", { style: { margin: 0, fontSize: "14px", color: "#aaa" }, children: screeningInfo.theater.screenType })] })] }), _jsx("hr", { style: { borderColor: "#444" } }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", margin: "15px 0" }, children: [_jsxs("div", { children: [_jsxs("p", { style: { margin: "5px 0" }, children: [screeningInfo.theater.name, " / ", screeningInfo.theater.screenName] }), _jsx("p", { style: { margin: "5px 0", fontWeight: "bold" }, children: formatDate(screeningInfo.time.start) }), _jsxs("p", { style: { margin: "5px 0" }, children: [formatTime(screeningInfo.time.start), " ~ ", formatTime(screeningInfo.time.end)] })] }), _jsx("img", { src: screeningInfo.movie.poster, alt: "poster", style: { width: "70px", borderRadius: "5px" } })] })] })) : _jsx("p", { children: "\uB370\uC774\uD130 \uB85C\uB529 \uC911..." }), _jsx("hr", { style: { borderColor: "#444" } }), _jsxs("div", { style: { display: "flex",
                                    border: "1px solid gray",
                                }, children: [_jsx("div", { style: { flex: 1, padding: "10px" }, children: _jsx(SeatLegend, {}) }), _jsx("div", { style: {
                                            width: "1px",
                                            backgroundColor: "#ccc",
                                            margin: "0px"
                                        } }), _jsxs("div", { style: { flex: 1, display: "flex", alignItems: "center", flexDirection: "column", padding: "10px" }, children: [_jsx("div", { style: { fontWeight: "bold", marginBottom: "10px" }, children: "\uC120\uD0DD\uC88C\uC11D" }), _jsx("div", { style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(2, 40px)", // 2칸
                                                    gap: "6px 8px", // 세로 / 가로 간격
                                                }, children: Array.from({ length: 8 }).map((_, index) => {
                                                    const seat = selectedSeats[index];
                                                    return (_jsx("div", { style: {
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
                                                        }, children: seat ? `${seat.row}${seat.number}` : "-" }, index));
                                                }) })] })] }), _jsxs("h3", { children: ["\uCD5C\uC885\uACB0\uC81C\uAE08\uC561: ", _jsx("span", { style: { color: "#5fdfffff" }, children: (selectedSeats.length * 12000).toLocaleString() }), "\uC6D0"] }), _jsx("button", { disabled: selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount, style: {
                                    width: "100%", padding: "15px",
                                    backgroundColor: (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount) ? "#555" : "#e74c3c",
                                    color: "#fff", border: "none", borderRadius: "5px", fontSize: "18px", fontWeight: "bold",
                                    cursor: (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount) ? "not-allowed" : "pointer"
                                }, children: selectedSeats.length === 0
                                    ? "인원과 좌석을 선택하세요"
                                    : selectedSeats.length !== totalPersonnelCount
                                        ? `${totalPersonnelCount - selectedSeats.length}석을 더 선택하세요`
                                        : "예약하기" })] })] }), _jsxs(CommonModal, { isOpen: isAlertOpen, onClose: () => setIsAlertOpen(false), children: [_jsx("h3", { style: { margin: 0, color: "#333" }, children: "\uC54C\uB9BC" }), _jsx("div", { style: { marginTop: "15px", marginBottom: "5px" }, children: alertMessage })] })] }));
};
export default SeatBooking;
