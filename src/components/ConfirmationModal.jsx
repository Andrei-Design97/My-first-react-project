import React from "react";
import styles from "./styles/ConfirmationModal.module.css";

const ConfirmationModal = ({ message = "Are you sure?", onConfirm, onCancel }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p>{message}</p>
                <div className={styles.buttons}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        Yes
                    </button>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
