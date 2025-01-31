import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/Register.module.css";
import Footer from "../components/Footer";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        birthDate: "",
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let error = "";

        if (name === "firstName" || name === "lastName") {
            if (!value || value.length < 2) {
                error = `${name === "firstName" ? "First" : "Last"} name must be at least 2 characters.`;
            }
        }

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value || !emailRegex.test(value)) {
                error = "Invalid email format.";
            }
        }

        if (name === "password") {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
            if (!value || !passwordRegex.test(value)) {
                error = "Password must be at least 6 characters long and include letters, numbers, and special characters.";
            }
        }

        if (name === "passwordConfirmation") {
            if (value !== formData.password) {
                error = "Passwords do not match.";
            }
        }

        if (name === "birthDate") {
            if (!value) {
                error = "Birth date is required.";
            } else {
                const birthYear = new Date(value).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;

                if (age < 18 || age > 120) {
                    error = "Age must be between 18 and 120 years.";
                }
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };

    const validateForm = () => {
        Object.keys(formData).forEach((key) => validateField(key, formData[key]));
        return Object.values(errors).every((error) => error === "");
    };

    const checkIfEmailExists = async (email) => {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please correct the errors in the form.", {
                position: "top-right",
            });
            return;
        }

        const emailExists = await checkIfEmailExists(formData.email);

        if (emailExists) {
            toast.error("An account with this email already exists.", {
                position: "top-right",
            });
            return;
        }

        try {
            await addDoc(collection(db, "users"), { ...formData, isAdmin: false });
            toast.success("Registration successful!", {
                duration: 1000,
                position: "top-right",
            });
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error("Failed to register. Please try again.", {
                position: "top-right",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.overlay}></div>
            <div className={styles.card}>
                <h1>Register</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}

                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}

                    <input
                        type="date"
                        name="birthDate"
                        placeholder="Birth Date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.birthDate && <p className={styles.error}>{errors.birthDate}</p>}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.password && <p className={styles.error}>{errors.password}</p>}

                    <input
                        type="password"
                        name="passwordConfirmation"
                        placeholder="Confirm Password"
                        value={formData.passwordConfirmation}
                        onChange={handleChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        className={styles.input}
                    />
                    {errors.passwordConfirmation && (
                        <p className={styles.error}>{errors.passwordConfirmation}</p>
                    )}

                    <button type="submit" className={styles.button}>
                        Register
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
            <Footer />
            <Toaster />
        </div>
    );
};

export default Register;
