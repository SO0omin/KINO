import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from "styled-components";
// 1. 스타일 정의 (껍데기)
const Overlay = styled.div `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
const ModalBox = styled.div `
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 280px;
  text-align: center;
`;
const Button = styled.button `
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
`;
export const CommonModal = ({ isOpen, onClose, children }) => {
    if (!isOpen)
        return null;
    return (_jsx(Overlay, { onClick: onClose, children: _jsxs(ModalBox, { onClick: (e) => e.stopPropagation(), children: [children, " ", _jsx(Button, { onClick: onClose, children: "\uD655\uC778" })] }) }));
};
