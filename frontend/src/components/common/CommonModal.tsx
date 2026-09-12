import React from 'react';
import styled, { keyframes } from "styled-components";
import { X } from 'lucide-react'; // 닫기 아이콘용

// 나타나는 애니메이션
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85); // 더 어둡고 시네마틱하게
  backdrop-filter: blur(4px); // 배경 흐림 효과
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 2px; // 둥근 모서리 대신 아주 살짝만 (모던)
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.3s ease-out;
  border-top: 4px solid #B91C1C; // 메인 컬러 포인트 상단 바
`;

const CloseIconButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #1A1A1A;
  opacity: 0.5;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

// Main의 .btn-primary 스타일을 그대로 가져온 버튼
export const ModalButton = styled.button`
  background-color: #B91C1C;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 12px 24px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 25px;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    background-color: #991B1B;
    transform: translateY(-2px);
  }
`;

// 내용물 폰트 스타일링을 위한 래퍼
const ContentWrapper = styled.div`
  font-family: 'Inter', sans-serif;
  color: #1A1A1A;
  line-height: 1.6;
  
  strong {
    font-family: 'Anton', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CommonModal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseIconButton onClick={onClose}>
          <X size={24} />
        </CloseIconButton>
        
        <ContentWrapper>
          {children}
        </ContentWrapper>

        {/* 확인 버튼을 여기서 공통으로 쓸 수도 있고, children 내부에서 넣을 수도 있습니다 */}
        <ModalButton onClick={onClose}>Confirm</ModalButton>
      </ModalBox>
    </Overlay>
  );
};