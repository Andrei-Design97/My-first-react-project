import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/EditFlat.module.css";

const EditFlat = () => {
    const { flatId } = useParams(); // Preluăm ID-ul apartamentului din URL
    const navigate = useNavigate();
    const [flatData, setFlatData] = useState({
        name: "",
        city: "",
        streetName: "",
        streetNumber: "",
        areaSize: "",
        hasAC: false,
        price: "",
        pictures: [], // Array pentru imagini (link-uri sau Base64)
    });
    const [loading, setLoading] = useState(true);
    const [uploadMethod, setUploadMethod] = useState("file"); // Metoda de upload: 'file' sau 'link'
    const [imageLinks, setImageLinks] = useState([""]); // Array pentru link-uri de imagini
    const [selectedFiles, setSelectedFiles] = useState([]); // Fișiere selectate din PC

    useEffect(() => {
        const fetchFlatData = async () => {
            const flatRef = doc(db, "flats", flatId);
            const flatSnap = await getDoc(flatRef);

            if (flatSnap.exists()) {
                const data = flatSnap.data();
                setFlatData(data);
                setImageLinks(data.pictures || []);
                setLoading(false);
            } else {
                toast.error("Flat not found.");
                navigate("/my-flats");
            }
        };

        fetchFlatData();
    }, [flatId, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFlatData({ ...flatData, [name]: type === "checkbox" ? checked : value });
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleLinkChange = (index, value) => {
        const updatedLinks = [...imageLinks];
        updatedLinks[index] = value;
        setImageLinks(updatedLinks);
    };

    const addLinkField = () => {
        setImageLinks([...imageLinks, ""]);
    };

    const removeLinkField = (index) => {
        const updatedLinks = imageLinks.filter((_, i) => i !== index);
        setImageLinks(updatedLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let pictures = [];

        // Procesăm fișierele selectate dacă metoda este 'file'
        if (uploadMethod === "file" && selectedFiles.length > 0) {
            pictures = await Promise.all(
                selectedFiles.map((file) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );
        } else {
            pictures = imageLinks.filter((link) => link.trim() !== ""); // Doar link-uri valide
        }

        try {
            const flatRef = doc(db, "flats", flatId);
            await updateDoc(flatRef, { ...flatData, pictures });

            toast.success("Flat details updated successfully!", {
                position: "top-right",
            });

            setTimeout(() => {
                navigate("/my-flats"); // Redirecționare către MyFlats după succes
            }, 1500);
        } catch (error) {
            console.error("Error updating flat:", error);
            toast.error("An error occurred. Please try again.");
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading flat details...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Edit Flat</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Flat Name"
                        value={flatData.name}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={flatData.city}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        name="streetName"
                        placeholder="Street Name"
                        value={flatData.streetName}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        name="streetNumber"
                        placeholder="Street Number"
                        value={flatData.streetNumber}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <input
                        type="number"
                        name="areaSize"
                        placeholder="Area Size (sqm)"
                        value={flatData.areaSize}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <div className={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                name="hasAC"
                                checked={flatData.hasAC}
                                onChange={handleChange}
                            />
                            Has AC
                        </label>
                    </div>
                    <input
                        type="number"
                        name="price"
                        placeholder="Price (USD)"
                        value={flatData.price}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                    <div className={styles.uploadOptions}>
                        <label>
                            <input
                                type="radio"
                                name="uploadMethod"
                                value="file"
                                checked={uploadMethod === "file"}
                                onChange={() => setUploadMethod("file")}
                            />
                            Upload Local Files
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="uploadMethod"
                                value="link"
                                checked={uploadMethod === "link"}
                                onChange={() => setUploadMethod("link")}
                            />
                            Enter Image URLs
                        </label>
                    </div>
                    {uploadMethod === "file" ? (
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    ) : (
                        <>
                            {imageLinks.map((link, index) => (
                                <div key={index} className={styles.linkInputContainer}>
                                    <input
                                        type="text"
                                        placeholder="Enter image URL"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        className={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLinkField(index)}
                                        className={styles.button}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkField}
                                className={styles.button}
                            >
                                Add another URL
                            </button>
                        </>
                    )}
                    <button type="submit" className={styles.button}>
                        Update Flat
                    </button>
                </form>
                <Toaster />
            </div>
        </div>
    );
};

export default EditFlat;
