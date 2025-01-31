import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/EditUser.module.css";

const EditUser = () => {
  const { userId } = useParams(); // ID-ul utilizatorului luat din URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    isAdmin: false,
    password: "",
    confirmPassword: "",
  });
  const [originalPassword, setOriginalPassword] = useState(""); // Stocăm parola originală
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setFormData({
          ...userData,
          password: "",
          confirmPassword: "",
        });
        setOriginalPassword(userData.password); // Stocăm parola existentă
        setLoading(false);
      } else {
        toast.error("User not found.");
        navigate("/all-users");
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const updatedData = {
      ...formData,
      password: formData.password || originalPassword, // Dacă parola este goală, păstrăm parola veche
    };
    delete updatedData.confirmPassword; // Nu salvăm confirmarea parolei

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updatedData);

      toast.success("User updated successfully!", {
        position: "top-right",
      });

      setTimeout(() => {
        navigate("/all-users"); // Redirecționare după succes
      }, 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  const loggedUserId = JSON.parse(localStorage.getItem("user"))?.id; // ID-ul utilizatorului logat

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Edit User</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="date"
            name="birthDate"
            placeholder="Birth Date"
            value={formData.birthDate}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <div className={styles.checkboxContainer}>
            <label>
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleChange}
                disabled={userId === loggedUserId} // Dezactivăm dacă este utilizatorul logat
              />
              Is Admin
            </label>
          </div>
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Update User
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
};

export default EditUser;
