import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import styles from "./styles/MyFlats.module.css";
import { IoIosCloudUpload } from "react-icons/io";

const MyFlats = ({ user }) => {
  const [flats, setFlats] = useState([]);
  const [view, setView] = useState("list"); // Controlează vizualizarea
  const [messages, setMessages] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    streetName: "",
    streetNumber: "",
    areaSize: "",
    hasAC: false,
    price: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageLinks, setImageLinks] = useState([""]);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Preluăm apartamentele utilizatorului
  const fetchFlats = async () => {
    try {
      const flatsRef = collection(db, "flats");
      const q = query(flatsRef, where("ownerId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const userFlats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFlats(userFlats);
      fetchMessages(userFlats);
    } catch (error) {
      console.error("Error fetching flats:", error);
      toast.error("Failed to fetch flats.");
    }
  };

  // Preluăm mesajele asociate apartamentelor
  const fetchMessages = async (flats) => {
    try {
      const messagesRef = collection(db, "messages");
      const messagesData = {};
      for (const flat of flats) {
        const q = query(messagesRef, where("flatId", "==", flat.id));
        const querySnapshot = await getDocs(q);
        messagesData[flat.id] = querySnapshot.docs.map((doc) => doc.data());
      }
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchFlats();
    }
  }, [user]);

  // Funcție pentru adăugarea unui apartament nou
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.city ||
      !formData.streetName ||
      !formData.price
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let pictures = [];
    if (uploadMethod === "file") {
      const convertFilesToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("File reading error"));
          reader.readAsDataURL(file);
        });

      pictures = await Promise.all(
        selectedFiles.map((file) => convertFilesToBase64(file))
      );
    } else {
      pictures = imageLinks.filter((link) => link.trim() !== "");
    }

    const newFlat = {
      ...formData,
      hasAC: formData.hasAC,
      price: parseFloat(formData.price),
      ownerId: user.id,
      ownerEmail: user.email,
      pictures,
    };

    try {
      await addDoc(collection(db, "flats"), newFlat);
      toast.success(`Flat "${formData.name}" added successfully!`);
      setFormData({
        name: "",
        city: "",
        streetName: "",
        streetNumber: "",
        areaSize: "",
        hasAC: false,
        price: "",
      });
      setSelectedFiles([]);
      setImageLinks([""]);
      fetchFlats();
    } catch (error) {
      console.error("Error adding flat:", error);
      toast.error("Failed to add flat.");
    }
  };

  // Confirmăm ștergerea apartamentului
  const confirmDeleteFlat = (flat) => {
    setSelectedFlat(flat);
    setShowModal(true);
  };

  // Ștergerea apartamentului selectat
  const handleDeleteFlat = async () => {
    try {
      if (!selectedFlat) return;

      // Ștergem mesajele asociate apartamentului
      const messagesQuery = query(
        collection(db, "messages"),
        where("flatId", "==", selectedFlat.id)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const deleteMessagesPromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteMessagesPromises);

      // Ștergem apartamentul
      await deleteDoc(doc(db, "flats", selectedFlat.id));

      setFlats(flats.filter((flat) => flat.id !== selectedFlat.id));
      toast.success(`Flat "${selectedFlat.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting flat:", error);
      toast.error("Failed to delete flat.");
    } finally {
      setShowModal(false);
      setSelectedFlat(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toggleButtons}>
        <label className={styles.selectLabel}>What do you want to do?</label>
        <select
          className={styles.selectDropdown}
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="list">See My Flats</option>
          <option value="add">Add New Flat</option>
        </select>
      </div>

      {view === "add" && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Add new Flat</h1>
          <input
            type="text"
            name="name"
            placeholder="Flat Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="text"
            name="streetName"
            placeholder="Street Name"
            value={formData.streetName}
            onChange={(e) =>
              setFormData({ ...formData, streetName: e.target.value })
            }
            className={styles.input}
            required
          />
          <input
            type="text"
            name="streetNumber"
            placeholder="Street Number"
            value={formData.streetNumber}
            onChange={(e) =>
              setFormData({ ...formData, streetNumber: e.target.value })
            }
            className={styles.input}
          />
          <input
            type="number"
            name="areaSize"
            placeholder="Area Size (m²)"
            value={formData.areaSize}
            onChange={(e) =>
              setFormData({ ...formData, areaSize: e.target.value })
            }
            className={styles.input}
          />
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="hasAC"
              checked={formData.hasAC}
              onChange={(e) =>
                setFormData({ ...formData, hasAC: e.target.checked })
              }
              className={styles.checkbox}
            />
            Has AC
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price (€)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
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
            <div className={styles.imageContainer}>
              <label htmlFor="file-upload" className={styles.customFileLabel}>
                Choose Files <IoIosCloudUpload className={styles.icon} />
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className={styles.hiddenFileInput}
              />
              {selectedFiles.length > 0 && (
                <div className={styles.imagePreviewContainer}>
                  {selectedFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className={styles.imagePreview}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {imageLinks.map((link, index) => (
                <div key={index} className={styles.linkInputContainer}>
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={link}
                    onChange={(e) =>
                      setImageLinks((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageLinks((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className={styles.button}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setImageLinks((prev) => [...prev, ""])}
                className={styles.button}
              >
                Add another URL
              </button>
            </>
          )}
          <button type="submit" className={styles.button}>
            Add Flat
          </button>
        </form>
      )}

{view === "list" && (
  <div className={styles.flatsList}>
    <h2 className={styles.flatsTitle}>Your Flats</h2>
    {flats.length > 0 ? (
      flats.map((flat) => (
        <div key={flat.id} className={styles.flatItem}>
          <h3>{flat.name}</h3>
          <p>
            Address: {flat.streetName} {flat.streetNumber}, {flat.city}
          </p>
          <p>Price: €{flat.price}</p>
          <p>Has AC: {flat.hasAC ? "Yes" : "No"}</p>
          <p>Owner: {flat.ownerEmail}</p>
          {flat.pictures?.length > 0 && (
            <div className={styles.imageContainer}>
              {flat.pictures.map((pic, i) => (
                <img
                  key={i}
                  src={pic}
                  alt="Flat"
                  className={styles.flatImage}
                />
              ))}
            </div>
          )}
          <div className={styles.actionButtons}>
            <button
              className={styles.editButton}
              onClick={() => navigate(`/edit-flat/${flat.id}`)}
            >
              Edit Flat
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => confirmDeleteFlat(flat)}
            >
              Delete Flat
            </button>
          </div>
          <div className={styles.messagesSection}>
            <h4>Messages</h4>
            {messages[flat.id]?.length > 0 ? (
              <ul className={styles.messageList}>
                {messages[flat.id].map((message, index) => (
                  <li key={index}>
                    <span className={styles.messageSender}>
                      From: {message.senderName}
                    </span>
                    <p className={styles.messageText}>
                      Message: {message.message}
                    </p>
                    <p className={styles.messageSender}>
                      Sent on: {message.createdAt}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noMessages}>No messages yet.</p>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className={styles.noFlats}>No flats added yet.</p>
    )}
  </div>
)}

      {showModal && (
        <ConfirmationModal
          message={`Are you sure you want to delete the flat "${selectedFlat?.name}"?`}
          onConfirm={handleDeleteFlat}
          onCancel={() => setShowModal(false)}
        />
      )}
      <Toaster />
    </div>
  );
};

export default MyFlats;
