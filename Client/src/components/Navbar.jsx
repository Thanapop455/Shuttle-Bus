import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css"; // ใช้ไฟล์ CSS แยก

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side (Logo & Links) */}
        <div className="navbar-left">
          <Link to={"/"} className="navbar-logo">
            {/* <img
              src="https://upload.wikimedia.org/wikipedia/th/thumb/1/12/%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A0%E0%B8%B1%E0%B8%8F%E0%B9%80%E0%B8%9E%E0%B8%8A%E0%B8%A3%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5.png/1200px-%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A0%E0%B8%B1%E0%B8%8F%E0%B9%80%E0%B8%9E%E0%B8%8A%E0%B8%A3%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5.png"
              alt="Phetchabun University Logo"
              style={{ width: "60px", height: "60px" }}
            /> */}
          </Link>

          <NavLink to={"map"} className="nav-link">
            แผนที่
          </NavLink>
          <NavLink to={"buses"} className="nav-link">
            รวมสถานะรถ
          </NavLink>
        </div>

        <div className="navbar-right">
          <NavLink to={"login"} className="login-button">
            Login
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
