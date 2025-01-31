import React, { useEffect, useState } from "react";
import {collection,query,where,getDocs,deleteDoc,doc,} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import styles from "./styles/EditFlats.module.css";

const EditFlats = () => {
  const { userId } = useParams();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFlatId, setSelectedFlatId] = useState(null);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const flatsRef = collection(db, "flats");
        const q = query(flatsRef, where("ownerId", "==", userId));
        const querySnapshot = await getDocs(q);
        const userFlats = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlats(userFlats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching flats:", error);
        toast.error("Failed to fetch flats.");
      }
    };

    fetchFlats();
  }, [userId]);

  const handleDeleteClick = (flatId) => {
    setSelectedFlatId(flatId); // Setăm ID-ul apartamentului care va fi șters
    setShowModal(true); // Afișăm modalul
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "flats", selectedFlatId));
      setFlats(flats.filter((flat) => flat.id !== selectedFlatId));
      toast.success("Flat deleted successfully.");
    } catch (error) {
      console.error("Error deleting flat:", error);
      toast.error("Failed to delete flat.");
    } finally {
      setShowModal(false);
      setSelectedFlatId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSelectedFlatId(null);
  };

  if (loading) {
    return <div className={styles.loading}>Loading flats...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>User Flats</h1>
      {flats.length > 0 ? (
        <ul className={styles.flatsList}>
          {flats.map((flat) => (
            <li key={flat.id} className={styles.flatItem}>
              <h3>{flat.name}</h3>
              <p>
                Address: {flat.streetName} {flat.streetNumber}, {flat.city}
              </p>
              <p>Price: €{flat.price}</p>
              <p>Area Size : {flat.areaSize} m²</p>
              <p>Has AC : {flat.hasAC ? "Yes" : "No"}</p>
              {flat.pictures?.length > 0 && (
                <div>
                  <p>Flat Pictures:</p>
                  <div>
                    {flat.pictures.map((pic, i) => (
                      <img key={i} src={pic} alt={`Flat ${i + 1}`} className={styles.flatPictures}/>
                    ))}
                  </div>
                </div>
              )}
              <p>Owner Email : {flat.ownerEmail}</p>
              <p>Views: {flat.views}</p>
              <p>Users added to favorites : {flat.favouritesCount}</p>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteClick(flat.id)}
              >
                Delete Flat
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No flats added by this user.</p>
      )}

      {/* Modalul de confirmare */}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this flat?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      <Toaster />
    </div>
  );
};

export default EditFlats;
