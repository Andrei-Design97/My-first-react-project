import React, { useState } from "react";
import { collection, query, where, getDocs, deleteDoc, addDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/DeleteAccount.module.css";

const DeleteAccount = ({ user, logout }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for deleting your account.");
            return;
        }

        setLoading(true);

        try {
            // 1. Stocăm motivul în colecția `deleteReasons`
            await addDoc(collection(db, "deleteReasons"), {
                userId: user.id,
                userEmail: user.email,
                reason,
                deletedAt: new Date().toISOString(),
            });

            // 2. Ștergem mesajele
            const messagesQuery = query(collection(db, "messages"), where("userId", "==", user.id));
            const messagesSnapshot = await getDocs(messagesQuery);
            const deleteMessagesPromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deleteMessagesPromises);

            // 3. Ștergem apartamentele
            const flatsQuery = query(collection(db, "flats"), where("ownerId", "==", user.id));
            const flatsSnapshot = await getDocs(flatsQuery);
            const deleteFlatsPromises = flatsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deleteFlatsPromises);

            //4. Stergere favorite
            const favouritesQuery = query(collection(db, "favourites"), where("userId", "==", user.id));
            const favouritesSnapshot = await getDocs(favouritesQuery);
            const deleteFavouritesPromises = favouritesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deleteFavouritesPromises);


            // 4. Ștergem contul utilizatorului
            await deleteDoc(doc(db, "users", user.id));

            toast.success("Account deleted successfully.");
            setTimeout(() => {
                logout();
                localStorage.removeItem("user");
                navigate("/");  
            }, 1500);
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error("Failed to delete account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.messageContainer}>
            <h1>Delete Account</h1>
            <p>Please tell us why you want to delete your account😢:</p>
            <textarea
                className={styles.textarea}
                placeholder="Enter your reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
            <button
                className={styles.deleteButton}
                onClick={handleDeleteAccount}
                disabled={loading}
            >
                {loading ? "Deleting..." : "Confirm Delete Account"}
            </button>
            </div>
            <Toaster />
        </div>
    );
};

export default DeleteAccount;
