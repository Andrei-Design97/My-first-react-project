import React, { useEffect, useState } from "react";
import {collection,getDocs,addDoc,query,where,deleteDoc,doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/SearchFlats.module.css";
import toast, { Toaster } from "react-hot-toast";
import { FaHeart } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";

const SearchFlats = ({ user }) => {
  const [flats, setFlats] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State pentru filtre
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");

  // State pentru sortare
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchFlats = () => {
      const flatsRef = collection(db, "flats");
  
      // Ascultă modificările în colecția "flats"
      const unsubscribe = onSnapshot(flatsRef, (querySnapshot) => {
        const flatsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlats(flatsList);
        setFilteredFlats(flatsList);
        setLoading(false);
      });
  
      return unsubscribe; // Returnează funcția de cleanup
    };
  
    const unsubscribe = fetchFlats(); // Păstrează referința la funcția de cleanup
    return () => {
      if (unsubscribe) unsubscribe(); // Cleanup la demontarea componentei
    };
  }, []);
  

  useEffect(() => {
    const fetchFavourites = () => {
      if (!user) return;
  
      const favouritesRef = collection(db, "favourites");
      const q = query(favouritesRef, where("userId", "==", user.id));
  
      // Ascultă modificările în colecția "favourites"
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const favList = querySnapshot.docs.map((doc) => doc.data().flatId);
        setFavourites(favList);
      });
  
      return unsubscribe; // Returnează funcția de cleanup
    };
  
    const unsubscribe = fetchFavourites();
    return () => {
      if (unsubscribe) unsubscribe(); // Cleanup la demontarea componentei
    };
  }, [user]);
  
  

  const handleAddToFavourites = async (flat) => {
    const alreadyFavourite = favourites.includes(flat.id);
  
    try {
      const flatRef = doc(db, "flats", flat.id);
  
      if (alreadyFavourite) {
        // Eliminare din favorite
        const favouritesRef = collection(db, "favourites");
        const q = query(
          favouritesRef,
          where("userId", "==", user.id),
          where("flatId", "==", flat.id)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const favDocId = querySnapshot.docs[0].id;
          await deleteDoc(doc(db, "favourites", favDocId));
  
          // Decrementăm contorul în Firebase
          await updateDoc(flatRef, {
            favouritesCount: (flat.favouritesCount || 0) - 1,
          });
  
          setFavourites(favourites.filter((id) => id !== flat.id));
          toast.success(`Removed "${flat.name}" from favourites.`);
        }
      } else {
        // Adăugare la favorite
        await addDoc(collection(db, "favourites"), {
          userId: user.id,
          flatId: flat.id,
        });
  
        // Incrementăm contorul în Firebase
        await updateDoc(flatRef, {
          favouritesCount: (flat.favouritesCount || 0) + 1,
        });
  
        setFavourites([...favourites, flat.id]);
        toast.success(`Added "${flat.name}" to favourites.`);
      }
    } catch (error) {
      console.error("Error updating favourites:", error);
      toast.error("Failed to update favourites.");
    }
  };
  

  const handleLeaveMessage = (flatId) => {
    navigate(`/leave-message/${flatId}`);
  };

  const applyFilters = () => {
    let filtered = flats;

    if (city) {
      filtered = filtered.filter((flat) =>
        flat.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (minPrice) {
      filtered = filtered.filter((flat) => flat.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((flat) => flat.price <= parseFloat(maxPrice));
    }
    if (minArea) {
      filtered = filtered.filter(
        (flat) => flat.areaSize >= parseFloat(minArea)
      );
    }
    if (maxArea) {
      filtered = filtered.filter(
        (flat) => flat.areaSize <= parseFloat(maxArea)
      );
    }

    setFilteredFlats(filtered);
  };

  const resetFilters = () => {
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setFilteredFlats(flats);
  };

  const sortFlats = (flatsList) => {
    let sortedFlats = [...flatsList];

    if (sortBy === "city") {
      sortedFlats.sort((a, b) => a.city.localeCompare(b.city));
    } else if (sortBy === "price") {
      sortedFlats.sort((a, b) => a.price - b.price);
    } else if (sortBy === "areaSize") {
      sortedFlats.sort((a, b) => a.areaSize - b.areaSize);
    }

    return sortedFlats;
  };

  const sortedFilteredFlats = sortFlats(filteredFlats);

  const handleSeeMoreDetails = async (flatId) => {
    try {
      const flatRef = doc(db, "flats", flatId);
      const flatDoc = await getDoc(flatRef);
  
      if (flatDoc.exists()) {
        const currentViews = flatDoc.data().views || 0;
        await updateDoc(flatRef, { views: currentViews + 1 });
      }
  
      navigate(`/flat-details/${flatId}`);
    } catch (error) {
      console.error("Error updating views:", error);
      toast.error("Failed to update views.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading flats...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hi!🖐 Let's find your dream flat!</h1>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Min Price (€)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Max Price (€)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <input
            type="number"
            placeholder="Min Area (m²)"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Max Area (m²)"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className={styles.filterInput}
          />
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="city">City</option>
            <option value="price">Price</option>
            <option value="areaSize">Area Size</option>
          </select>
        </div>
        <div className={styles.filterButtons}>
          <button className={styles.filterButton} onClick={applyFilters}>
            Apply Filters
          </button>
          <button className={styles.resetButton} onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className={styles.flatGrid}>
        {sortedFilteredFlats.map((flat) => (
          <div key={flat.id} className={styles.flatCard}>
            <div className={styles.header}>
              <h2 className={styles.flatDescription}>{flat.name}</h2>
              <FaHeart
                className={`${styles.heartIcon} ${
                  favourites.includes(flat.id) ? styles.filledHeart : ""
                }`}
                onClick={() => handleAddToFavourites(flat)}
              />
            </div>
            <p className={styles.flatDescription}>
              <strong>Location:</strong> {flat.city}, {flat.streetName}{" "}
              {flat.streetNumber}
            </p>
            <p className={styles.flatDescription}>
              <strong>Area Size:</strong> {flat.areaSize} m<sup>2</sup>
            </p>
            <p className={styles.flatDescription}>
              <strong>Has AC:</strong> {flat.hasAC ? "Yes" : "No"}
            </p>
            <p className={styles.flatDescription}>
              <strong>Price:</strong> €{flat.price}
            </p>
            <p className={styles.flatDescription}>
              <strong>Owner:</strong> {flat.ownerEmail}
            </p>
            <p className={styles.flatDescription}>
              <strong>👁</strong> {flat.views || 0}
            </p>
            <p className={styles.flatDescription}>
              <strong>❤️ Added to Favourites:</strong> {flat.favouritesCount || 0} users
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={styles.messageButton}
                onClick={() => handleLeaveMessage(flat.id)}
              >
                Leave a Message
              </button>
              <button
                className={styles.detailsButton}
                onClick={() => handleSeeMoreDetails(flat.id)}
              >
                See More Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <Toaster />
    </div>
  );
};

export default SearchFlats;
