import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/MyProfile.module.css";
import { useNavigate } from "react-router-dom";

const MyProfile = ({ email }) => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [flatsCount, setFlatsCount] = useState(0); // Stocăm numărul apartamentelor
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (!email) {
                    setError("User email is not available. Please log in again.");
                    return;
                }

                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    setProfileData({ id: userDoc.id, ...userDoc.data() });

                    // Preluăm numărul apartamentelor
                    const flatsRef = collection(db, "flats");
                    const flatsQuery = query(flatsRef, where("ownerEmail", "==", email));
                    const flatsSnapshot = await getDocs(flatsQuery);

                    setFlatsCount(flatsSnapshot.size); // Setăm numărul apartamentelor
                } else {
                    setError("User does not exist in the database.");
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("An error occurred while fetching user data.");
            }
        };

        fetchProfileData();
    }, [email]);

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!profileData) {
        return <div className={styles.loading}>Loading...</div>;
    }

    const profileFields = [
        { label: "First Name", value: profileData.firstName },
        { label: "Last Name", value: profileData.lastName },
        { label: "Email", value: profileData.email },
        { label: "Birth Date", value: profileData.birthDate },
        { label: "Number of Flats Added", value: flatsCount }, // Afișăm numărul apartamentelor adăugate
    ];

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <h1>My Profile</h1>
                <ul className={styles.profileDetails}>
                    {profileFields.map((field, index) => (
                        <li key={index} className={styles.profileField}>
                            <strong>{field.label}: </strong>
                            <span>{field.value}</span>
                        </li>
                    ))}
                </ul>
                <button
                    className={styles.editButton}
                    onClick={() => navigate(`/update-profile`)}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default MyProfile;
