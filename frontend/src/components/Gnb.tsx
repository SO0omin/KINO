import React from "react";
import { Link } from "react-router-dom"; // 라우팅 사용할 때

const Gnb: React.FC = () => {
  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
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