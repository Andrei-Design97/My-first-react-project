import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/FavouriteFlats.module.css";
import toast, { Toaster } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";

const FavouriteFlats = ({ user }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFavouriteId, setSelectedFavouriteId] = useState(null); // ID-ul apartamentului selectat pentru ștergere

  const fetchFavourites = async () => {
    if (!user) {
      return;
    }
    try {
      const favouritesRef = collection(db, "favourites");
      const q = query(favouritesRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const favouriteFlatsIds = querySnapshot.docs.map((doc) => ({
        favouriteId: doc.id,
        flatId: doc.data().flatId,
      }));

      if (favouriteFlatsIds.length === 0) {
        setFavourites([]);
        setLoading(false);
        return;
      }

      const flatsRef = collection(db, "flats");
      const flatsQuerySnapshot = await getDocs(flatsRef);
      const flatsList = flatsQuerySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((flat) =>
          favouriteFlatsIds.some((fav) => fav.flatId === flat.id)
        )
        .map((flat) => ({
          ...flat,
          favouriteId: favouriteFlatsIds.find((fav) => fav.flatId === flat.id)
            ?.favouriteId,
        }));

      setFavourites(flatsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favourites:", error);
      toast.error("Failed to fetch favourites.");
    }
  };

  const handleRemoveClick = (favouriteId) => {
    setSelectedFavouriteId(favouriteId); // Stocăm ID-ul apartamentului selectat
    setShowModal(true); // Afișăm modalul
  };

  const handleConfirmRemove = async () => {
    try {
      await deleteDoc(doc(db, "favourites", selectedFavouriteId));
      setFavourites(
        favourites.filter((flat) => flat.favouriteId !== selectedFavouriteId)
      );
      toast.success("Removed from favourites.");
    } catch (error) {
      console.error("Error removing favourite:", error);
      toast.error("Failed to remove from favourites.");
    } finally {
      setShowModal(false);
      setSelectedFavouriteId(null); // Resetăm starea după ștergere
    }
  };

  const handleCancelRemove = () => {
    setShowModal(false); // Închidem modalul
    setSelectedFavouriteId(null);
  };

  useEffect(() => {
    fetchFavourites();
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Loading favourite flats...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Favourite Flats❤</h1>
      {favourites.length > 0 ? (
        <div className={styles.flatGrid}>
          {favourites.map((flat) => (
            <div key={flat.id} className={styles.flatCard}>
              <div className={styles.header}>
                <h2>{flat.name}</h2>
              </div>
              <p>
                <strong>Location:</strong> {flat.city}, {flat.streetName}{" "}
                {flat.streetNumber}
              </p>
              <p>
                <strong>Area Size:</strong> {flat.areaSize} m<sup>2</sup>
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
              <div className={styles.imageContainer}>
                {flat.pictures?.length > 0 &&
                  flat.pictures.map((pic, i) => (
                    <img
                      key={i}
                      src={pic}
                      alt={`Flat ${i + 1}`}
                      className={styles.flatImage}
                    />
                  ))}
              </div>

              <button
                className={styles.removeButton}
                onClick={() => handleRemoveClick(flat.favouriteId)}
              >
                Remove from Favourites
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No favourite flats added yet.</p>
      )}

      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to remove this flat from your favourites?"
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}
      <Toaster />
    </div>
  );
};

export default FavouriteFlats;
