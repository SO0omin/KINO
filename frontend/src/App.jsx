import React, { useEffect, useState } from 'react';

function App() {
  // 서버에서 받아온 데이터를 저장할 공간 (상태)
  const [message, setMessage] = useState("");

  useEffect(() => {
    // localhost 대신 실제 EC2 서버의 공인 IP와 백엔드 포트를 적어주세요!
    fetch("http://13.209.65.96:8080/") 
      .then(response => response.text())
      .then(data => {
        console.log(data);
        setMessage(data);
      })
      .catch(error => console.log("에러 발생: ", error));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>KINO 프로젝트 메인</h1>
      <p>서버에서 온 메시지:</p>
      {/* 데이터가 있으면 보여주고, 없으면 로딩 중 표시 */}
      <h2 style={{ color: 'blue' }}>{message || "서버 연결 중..."}</h2>
    </div>
  );
}

export default App;
