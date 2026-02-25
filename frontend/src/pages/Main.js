import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
function Main() {
    const [message, setMessage] = useState("");
    useEffect(() => {
        fetch("http://localhost:8080/") // EC2 서버 올릴 때는 공인 IP로 변경
            .then((res) => res.text())
            .then((data) => setMessage(data))
            .catch((err) => console.error("서버 연결 에러:", err));
    }, []);
    return (_jsxs("div", { style: { textAlign: "center", marginTop: "50px" }, children: [_jsx("h1", { children: "KINO \uD504\uB85C\uC81D\uD2B8 \uBA54\uC778" }), _jsx("p", { children: "\uC11C\uBC84\uC5D0\uC11C \uC628 \uBA54\uC2DC\uC9C0:" }), _jsx("h2", { style: { color: "blue" }, children: message || "서버 연결 중..." })] }));
}
export default Main;
