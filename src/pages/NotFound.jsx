import React from "react";
import Lottie from "lottie-react"; 
import notFoundAnimation from "../assets/Animation - 1736103275269.json"; 
import styles from "./styles/NotFound.module.css";

const NotFound = () => {
    const handleGoBack = () => {
        window.location.href = "/dashboard"; // Navigare la dashboard
    };

    return (
        <div className={styles.container}>
            <Lottie
                animationData={notFoundAnimation}
                loop={true}
                className={styles.lottiePlayer}
            />
            <p className={styles.message}>
                It seems you're lost! Let’s get you back on track.
            </p>
            <button className={styles.backButton} onClick={handleGoBack}>
                Go Back to Dashboard
            </button>
        </div>
    );
};

export default NotFound;
