import styled from "styled-components";

// 1. 스타일 정의 (껍데기)
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 280px;
  text-align: center;
`;

const Button = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
`;

// 2. 컴포넌트 정의
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // 여기에 '내용'이 들어갑니다.
}

export const CommonModal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        {children} {/* 가져다 쓰는 곳에서 넣은 내용이 여기 보임 */}
        <Button onClick={onClose}>확인</Button>
      </ModalBox>
    </Overlay>
  );
};