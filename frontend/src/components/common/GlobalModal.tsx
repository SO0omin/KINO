import React, { useState, useEffect } from 'react';
import { CommonModal } from './CommonModal';

export const GlobalModal = () => {
  const [config, setConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onClose: (() => void) | null;
  }>({ isOpen: false, title: '', message: '', onClose: null });

  useEffect(() => {
    const handleAlert = (e: any) => {
      setConfig({
        isOpen: true,
        title: e.detail.title || 'SYSTEM ERROR',
        message: e.detail.message,
        onClose: e.detail.onClose || null // 콜백 저장
      });
    };

    window.addEventListener('cinema-alert', handleAlert);
    return () => window.removeEventListener('cinema-alert', handleAlert);
  }, []);

  const handleClose = () => {
    if (config.onClose) config.onClose(); // 콜백 실행
    setConfig({ ...config, isOpen: false, onClose: null });
  };

  return (
    <CommonModal isOpen={config.isOpen} onClose={handleClose}>
      <strong>{config.title}</strong>
      <p style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>{config.message}</p>
    </CommonModal>
  );
};