import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/UpdateProfile.module.css";

const UpdateProfile = ({ user }) => {
  const { userId } = useParams(); // În cazul în care adminul editează un alt profil
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [originalPassword, setOriginalPassword] = useState(""); // Stocăm parola inițială
  const [originalEmail, setOriginalEmail] = useState(""); // Stocăm email-ul inițial pentru comparație

  useEffect(() => {
    const fetchUserData = async () => {
      const idToFetch = userId || user.id;
      const userRef = doc(db, "users", idToFetch);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setFormData({
          ...userData,
          password: "",
          confirmPassword: "",
        });
        setOriginalPassword(userData.password);
        setOriginalEmail(userData.email);
        setLoading(false);
      } else {
        toast.error("User not found.");
        navigate("/dashboard");
      }
    };

    fetchUserData();
  }, [userId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const updatedData = {
      ...formData,
      password: formData.password || originalPassword,
    };
    delete updatedData.confirmPassword;

    try {
      // Verificăm dacă email-ul există deja în baza de date
      if (originalEmail !== updatedData.email) {
          const usersRef = collection(db, "users");
          const emailQuery = query(usersRef, where("email", "==", updatedData.email));
          const emailSnapshot = await getDocs(emailQuery);

          if (!emailSnapshot.empty) {
              toast.error("This email is already in use.");
              return; // Oprim procesul dacă email-ul există
          }
      }

      const userRef = doc(db, "users", userId || user.id);
      await updateDoc(userRef, updatedData);

      // Dacă email-ul a fost schimbat, actualizăm toate documentele din `flats`
      if (originalEmail !== updatedData.email) {
        const flatsRef = collection(db, "flats");
        const q = query(flatsRef, where("ownerId", "==", user.id));
        const querySnapshot = await getDocs(q);

        const batchPromises = querySnapshot.docs.map((flatDoc) =>
          updateDoc(flatDoc.ref, { ownerEmail: updatedData.email })
        );

        await Promise.all(batchPromises);
        toast.success("Flats owner email updated successfully!");
      }

      toast.success("Profile updated successfully!", {
        position: "top-right",
      });

      // Redirecționăm către login după succes
      setTimeout(() => {
        localStorage.removeItem("user"); // Ștergem utilizatorul din localStorage
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.card}>
        <h1>Edit Profile</h1>
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
            Update Profile
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
};

export default UpdateProfile;
