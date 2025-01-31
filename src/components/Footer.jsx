import React from 'react';
import styles from './styles/Footer.module.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.socialAndContactWrapper}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin />
                </a>
                <span className={styles.contactInfo}>
                    <a href="mailto:support@rentease.com">support@rentease.com</a> | <a href="tel:+123456789">+1 234 567 89</a>
                </span>
            </div>
            <p className={styles.centerText}>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
        </footer>
    );
}

export default Footer;