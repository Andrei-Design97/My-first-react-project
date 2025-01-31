import React, { useEffect } from "react";
import styles from "./styles/Popup.module.css";

function Popup({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.popup}>
      <p>If you need assistance, you can chat with our bot😊.</p>
      <button onClick={onClose} className={styles.closeButton}>Got it</button>
    </div>
  );
}

export default Popup;
