import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { StyledSeat } from './Seat.styles';
const LegendItem = ({ children, label }) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [children, _jsx("span", { style: { fontSize: "13px" }, children: label })] }));
export const SeatLegend = () => {
    return (_jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        }, children: [_jsx(LegendItem, { label: "\uC120\uD0DD\uB41C \uC88C\uC11D", children: _jsx(StyledSeat, { "$status": "AVAILABLE", "$seatType": "NORMAL", "$isSelected": true, "$isCoupleInvalid": false, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) }), _jsx(LegendItem, { label: "\uC608\uB9E4 \uC644\uB8CC", children: _jsx(StyledSeat, { "$status": "RESERVED", "$seatType": "NORMAL", "$isSelected": false, "$isCoupleInvalid": false, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) }), _jsx(LegendItem, { label: "\uC120\uD0DD \uBD88\uAC00", children: _jsx(StyledSeat, { "$status": "AVAILABLE", "$seatType": "NORMAL", "$isSelected": false, "$isCoupleInvalid": true, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) }), _jsx(LegendItem, { label: "\uC77C\uBC18 \uC88C\uC11D", children: _jsx(StyledSeat, { "$status": "AVAILABLE", "$seatType": "NORMAL", "$isSelected": false, "$isCoupleInvalid": false, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) }), _jsx(LegendItem, { label: "\uC7A5\uC560\uC778\uC11D", children: _jsx(StyledSeat, { "$status": "AVAILABLE", "$seatType": "DISABLED", "$isSelected": false, "$isCoupleInvalid": false, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) }), _jsx(LegendItem, { label: "\uCEE4\uD50C\uC11D", children: _jsx(StyledSeat, { "$status": "AVAILABLE", "$seatType": "COUPLE", "$isSelected": false, "$isCoupleInvalid": false, "$posX": 0, "$posY": 0, style: { position: "relative", pointerEvents: "none" } }) })] }));
};
