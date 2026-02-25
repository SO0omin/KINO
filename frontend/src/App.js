import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Gnb from "./components/Gnb";
import Main from "./pages/Main";
// 폴더 구조에 맞춰 import 경로 수정
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";
function App() {
    return (_jsxs(Router, { children: [_jsx(Gnb, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Main, {}) }), _jsx(Route, { path: "/payment", element: _jsx(PaymentPage, {}) }), _jsx(Route, { path: "/payment/success", element: _jsx(PaymentSuccessPage, {}) }), _jsx(Route, { path: "/payment/fail", element: _jsx(PaymentFailPage, {}) })] })] }));
}
export default App;
