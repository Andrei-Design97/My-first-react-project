import React from "react";
import styles from "./styles/PrivacyPolicy.module.css";

const PrivacyPolicy = () => {
  return (
    <div className={styles.privacyPolicy}>
      <h1>Privacy Policy</h1>
      <p>
        Welcome to our Privacy Policy page! When you use our website services,
        you trust us with your information. This Privacy Policy is meant to help
        you understand what data we collect, why we collect it, and what we do
        with it. This is important; we hope you will take time to read it
        carefully.
      </p>
      <h2>What Information Do We Collect?</h2>
      <p>
        We collect information to provide better services to our users – from
        figuring out basic stuff like which language you speak, to more complex
        things like which ads you’ll find most useful or the people who matter
        most to you online.
      </p>
      <h2>How Do We Use Information?</h2>
      <p>
        We use the information we collect in various ways, including to:
      </p>
      <ul>
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
      </ul>
      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, you can contact us
        at support@rentease.com.
      </p>
    </div>
  );
};

export default PrivacyPolicy;