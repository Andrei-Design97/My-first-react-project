import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./styles/Header.module.css";
import logo from "../assets/logo.png";
import ConfirmationModal from "../components/ConfirmationModal";

const Header = ({ user, logout }) => {
  const [showModal, setShowModal] = useState(false); // Modal confirmare logout
  const [menuOpen, setMenuOpen] = useState(false); // Stare pentru hamburger menu
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    setMenuOpen(false); // Închidem meniul hamburger 
    setShowModal(true); // Afișăm modalul de confirmare
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
    setShowModal(false);
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev); // Toggle pentru meniul hamburger
  };

  useEffect(() => {
    setMenuOpen(false); // Închidem meniul la schimbarea locației
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img
          src={logo}
          alt="Company Logo"
          className={styles.logo}
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className={styles.greeting}>
        Hello, {user?.firstName} {user?.lastName}
      </div>

      {/* Buton hamburger */}
      <button className={styles.hamburger} onClick={toggleMenu}>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
        <button
          className={`${styles.navButton} ${isActive("/search-flats") ? styles.active : ""}`}
          onClick={() => navigate("/search-flats")}
        >
          Home (Search Flats)
        </button>
        <button
          className={`${styles.navButton} ${isActive("/profile") ? styles.active : ""}`}
          onClick={() => navigate("/profile")}
        >
          My Profile
        </button>
        <button
          className={`${styles.navButton} ${isActive("/my-flats") ? styles.active : ""}`}
          onClick={() => navigate("/my-flats")}
        >
          My Flats
        </button>
        <button
          className={`${styles.navButton} ${isActive("/favourites") ? styles.active : ""}`}
          onClick={() => navigate("/favourites")}
        >
          Favourites
        </button>
        {user?.isAdmin && (
          <button
            className={`${styles.navButton} ${isActive("/all-users") ? styles.active : ""}`}
            onClick={() => navigate("/all-users")}
          >
            All Users
          </button>
        )}
        <button
          onClick={handleLogoutClick}
          className={styles.navButton}
        >
          Logout
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => navigate("/delete-account")}
        >
          Delete Account
        </button>
      </nav>
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </header>
  );
};

export default Header;
