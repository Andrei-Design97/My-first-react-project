import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer"; 
import styles from "./styles/Landing.module.css";

const Landing = () => {
    return (
        <div className={styles.landingContainer}>
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <h1 className={styles.title}>Welcome to RentEase</h1>
                <p className={styles.subtitle}>Your gateway to finding the perfect flat</p>
                <div className={styles.buttons}>
                    <Link to="/login" className={styles.button}>
                        Login
                    </Link>
                    <Link to="/register" className={styles.button}>
                        Register
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Landing;
