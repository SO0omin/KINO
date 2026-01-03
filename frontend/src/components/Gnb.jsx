import React from 'react';

function Gnb() {
  return (
    <nav style={{
      padding: '10px 20px',
      background: '#333',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h2 style={{ margin: 0 }}>KINO Project</h2>
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        gap: '20px',
        margin: 0
      }}>
        <li>홈</li>
        <li>영화 목록</li>
        <li>게시판</li>
      </ul>
    </nav>
  );
}

// 이 줄이 가장 중요합니다! 아까 에러가 났던 원인이에요.
export default Gnb;