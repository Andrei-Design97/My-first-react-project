import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import styles from "./styles/Login.module.css";
import Footer from "../components/Footer";
import { FaEnvelope, FaLock } from "react-icons/fa"; 

const Login = ({ setUser}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email), where("password", "==", formData.password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const userInfo = {
          id: userDoc.id,
          email: userData.email,
          isAdmin: userData.isAdmin,
          firstName: userData.firstName,
          lastName: userData.lastName,
        };

        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);

        
        toast.success("Login successful!", {
          duration: 1000,
          position: "top-right",
        });

        setRedirecting(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error("Invalid email or password.", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className={styles.container}>
     

      <div className={styles.overlay}></div>
      <div className={styles.card}>
        <h1>Login</h1>
        {redirecting ? (
          <div className={styles.redirectMessage}>
            <p>Redirecting to Dashboard...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputContainer}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputContainer}>
                <FaLock className={styles.icon} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={styles.button}>
                Login
              </button>
            </form>
            <p>
              Don&apos;t have an account? <Link to="/register">Register here</Link>
            </p>
          </>
        )}
      </div>
      <Toaster />
      <Footer />
    </div>
  );
};

export default Login;
