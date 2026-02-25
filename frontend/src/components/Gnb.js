import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link } from "react-router-dom"; // 라우팅 사용할 때
const Gnb = () => {
    return (_jsx("nav", { style: styles.nav, children: _jsxs("ul", { style: styles.ul, children: [_jsx("li", { children: _jsx(Link, { to: "/", children: "Home" }) }), _jsx("li", { children: _jsx(Link, { to: "/about", children: "About" }) }), _jsx("li", { children: _jsx(Link, { to: "/contact", children: "Contact" }) })] }) }));
};
const styles = {
    nav: {
        backgroundColor: "#222",
        padding: "10px 20px",
    },
    ul: {
        listStyle: "none",
        display: "flex",
        gap: "15px",
        margin: 0,
        padding: 0,
    },
};
export default Gnb;
