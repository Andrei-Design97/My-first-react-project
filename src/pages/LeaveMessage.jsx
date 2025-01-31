import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/LeaveMessage.module.css";

const LeaveMessage = ({ user }) => {
    const { flatId } = useParams();
    const navigate = useNavigate();
    const [flatDetails, setFlatDetails] = useState(null);
    const [message, setMessage] = useState("");

    // Funcție pentru a formata data într-un format lizibil
    const formatDateForFirebase = (date) => {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    useEffect(() => {
        const fetchFlatDetails = async () => {
            try {
                const flatRef = doc(db, "flats", flatId);
                const flatSnap = await getDoc(flatRef);
                if (flatSnap.exists()) {
                    setFlatDetails(flatSnap.data());
                } else {
                    toast.error("Flat not found!");
                    navigate("/search-flats");
                }
            } catch (error) {
                console.error("Error fetching flat details:", error);
                toast.error("Failed to load flat details.");
            }
        };

        fetchFlatDetails();
    }, [flatId, navigate]);

    const handleSendMessage = async () => {
        if (!message.trim()) {
            toast.error("Please write a message.");
            return;
        }

        try {
            const formattedDate = formatDateForFirebase(new Date()); 
            await addDoc(collection(db, "messages"), {
                userId: user.id,
                flatId,
                message,
                senderName: `${user.firstName} ${user.lastName}`,
                createdAt: formattedDate, // Salvăm data formatată direct
            });
            toast.success("Message sent successfully!");
            setMessage("");
            navigate("/search-flats");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        }
    };

    if (!flatDetails) {
        return <div className={styles.loading}>Loading flat details...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.paragraph}>Leave a Message</h1>
            <div className={styles.flatDetails}>
                <p className={styles.paragraph}>
                    <strong>Name:</strong> {flatDetails.name}
                </p>
                <p className={styles.paragraph}>
                    <strong>Location:</strong> {flatDetails.city}, {flatDetails.streetName} {flatDetails.streetNumber}
                </p>
                <p className={styles.paragraph}>
                    <strong>Price:</strong> €{flatDetails.price}
                </p>
                <p className={styles.paragraph}>
                    <strong>Leave a message for the owner of the apartment to discuss more details.</strong>
                </p>
                <textarea
                    className={styles.textarea}
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className={styles.sendButton} onClick={handleSendMessage}>
                    Send Message
                </button>
            </div>
            <Toaster />
        </div>
    );
};

export default LeaveMessage;
