import React, { useEffect, useState } from 'react';
import Gnb from './components/Gnb'; // Gnb 가져오기
import Home from './pages/Home';    // Home 가져오기

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
    <div className="App">
      <Gnb />
      
      {/* 서버에서 온 메시지가 있다면 상단에 작게 띄워보기 (연동 확인용) */}
      {message && (
        <div style={{ backgroundColor: '#e3f2fd', padding: '10px', textAlign: 'center' }}>
          서버 응답: {message}
        </div>
      )}

      {/* Home 페이지에 데이터를 넘겨주고 싶다면? (Props 사용) */}
      <Home serverData={message} />
    </div>
  );
}

export default App;
