import React, { useEffect, useState } from 'react';

function App() {
  // 서버에서 받아온 데이터를 저장할 공간 (상태)
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 1. 스프링 부트 서버 주소로 요청을 보냅니다.
    fetch("http://localhost:8080/") 
      .then(response => response.text()) // 글자 형태로 받기
      .then(data => {
        console.log(data); // 브라우저 콘솔창에서 확인용
        setMessage(data);   // 받은 데이터를 변수에 저장
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
