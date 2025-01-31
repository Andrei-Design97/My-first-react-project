import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/CookieConsent.module.css";

const CookieConsent = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleAccept = () => {
    setIsVisible(false);
    localStorage.setItem("cookiesAccepted", "true"); // Salvează acceptul utilizatorului
    if (onAccept) {
      onAccept();
    }
  };

  const handleLearnMore = () => {
    navigate("/privacy-policy"); // Navighează către pagina de Privacy Policy
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.cookieConsent}>
      <p>
        This website uses cookies to ensure you get the best experience on our website.{" "}
        <button onClick={handleLearnMore} className={styles.learnMore}>
          Learn more
        </button>
      </p>
      <button onClick={handleAccept} className={styles.acceptButton}>
        Accept
      </button>
    </div>
  );
};

export default CookieConsent;
