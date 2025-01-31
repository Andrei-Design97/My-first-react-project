import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/FlatDetails.module.css";
import toast, { Toaster } from "react-hot-toast";

const FlatDetails = () => {
    const { flatId } = useParams(); // Preia ID-ul apartamentului din URL
    const [flat, setFlat] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlatDetails = async () => {
            try {
                const flatRef = doc(db, "flats", flatId);
                const flatSnap = await getDoc(flatRef);

                if (flatSnap.exists()) {
                    setFlat(flatSnap.data());
                } else {
                    toast.error("Flat not found.");
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching flat details:", error);
                toast.error("An error occurred. Please try again.");
                setLoading(false);
            }
        };

        fetchFlatDetails();
    }, [flatId]);

    if (loading) {
        return <div className={styles.loading}>Loading flat details...</div>;
    }

    if (!flat) {
        return <div className={styles.error}>Flat not found.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{flat.name}</h1>
            <div className={styles.detailsCard}>
                <p>
                    <strong>Location:</strong> {flat.city}, {flat.streetName} {flat.streetNumber}
                </p>
                <p>
                    <strong>Area Size:</strong> {flat.areaSize || "N/A"} m<sup>2</sup>
                </p>
                <p>
                    <strong>Has AC:</strong> {flat.hasAC ? "Yes" : "No"}
                </p>
                <p>
                    <strong>Price:</strong> €{flat.price}
                </p>
                <p>
                    <strong>Owner:</strong> {flat.ownerEmail}
                </p>
                {flat.pictures?.length > 0 && (
                    <div className={styles.imageGallery}>
                        <h3>Flat Pictures:</h3>
                        <div className={styles.imageGrid}>
                            {flat.pictures.map((pic, i) => (
                                <img key={i} src={pic} alt={`Flat ${i + 1}`} className={styles.flatImage} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Toaster />
        </div>
    );
};

export default FlatDetails;
