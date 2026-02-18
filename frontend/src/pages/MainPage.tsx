import { useEffect, useState } from "react";

function Main() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/") // EC2 서버 올릴 때는 공인 IP로 변경
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => console.error("서버 연결 에러:", err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>KINO 프로젝트 메인</h1>
      <p>서버에서 온 메시지:</p>
      <h2 style={{ color: "blue" }}>{message || "서버 연결 중..."}</h2>
    </div>
  );
}

export default Main;