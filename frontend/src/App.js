import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Gnb from "./components/Gnb.tsx";
import Main from "./pages/Main.tsx";
// 폴더 구조에 맞춰 import 경로 수정
import PaymentPage from "./pages/Payment/PaymentPage.tsx";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage.tsx";
import PaymentFailPage from "./pages/Payment/PaymentFailPage.tsx";
import MyPage from "./pages/MyPage.tsx";
function AppRoutes() {
    const location = useLocation();
    const hideGnb = location.pathname.startsWith("/my-page");
    return (_jsxs(_Fragment, { children: [!hideGnb && _jsx(Gnb, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Main, {}) }), _jsx(Route, { path: "/payment", element: _jsx(PaymentPage, {}) }), _jsx(Route, { path: "/payment/success", element: _jsx(PaymentSuccessPage, {}) }), _jsx(Route, { path: "/payment/fail", element: _jsx(PaymentFailPage, {}) }), _jsx(Route, { path: "/my-page", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/reservations", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/vouchers", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/vouchers/movie", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/vouchers/store", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/coupons", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/points", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/point-password", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/movie-story", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/events", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/inquiries", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/payments", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/cards", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/profile", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my-page/profile/preferences", element: _jsx(MyPage, {}) })] })] }));
}
function App() {
    return (_jsx(Router, { children: _jsx(AppRoutes, {}) }));
}
export default App;
