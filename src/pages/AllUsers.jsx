import React, { useEffect, useState } from "react";
import {collection,getDocs,deleteDoc,doc,query,where,} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/AllUsers.module.css";
import ConfirmationModal from "../components/ConfirmationModal";

const AllUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userType: "",
    ageRange: { min: 0, max: 120 },
    flatsRange: { min: 0, max: 100 },
  });
  const [sortCategory, setSortCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const usersList = querySnapshot.docs.map((doc) => {
          const userData = doc.data();
          const birthYear = new Date(userData.birthDate).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;

          return {
            id: doc.id,
            ...userData,
            age,
          };
        });

        const usersWithFlatsCount = await Promise.all(
          usersList.map(async (userData) => {
            const flatsRef = collection(db, "flats");
            const flatsQuery = query(flatsRef,where("ownerId", "==", userData.id));
            const flatsSnapshot = await getDocs(flatsQuery);
            return {
              ...userData,
              flatsCount: flatsSnapshot.size,
            };
          })
        );

        setUsers(usersWithFlatsCount);
        setFilteredUsers(usersWithFlatsCount);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeleteClick = (userId) => {
    const selectedUser = users.find((u) => u.id === userId);
    if (selectedUser?.isAdmin) {
      toast.error("You cannot delete an admin user.");
      return;
    }
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // 1: Preluăm toate apartamentele utilizatorului
      const flatsRef = collection(db, "flats");
      const flatsQuery = query(flatsRef, where("ownerId", "==", selectedUserId));
      const flatsSnapshot = await getDocs(flatsQuery);

      // 2: Ștergem fiecare apartament al utilizatorului
      const deletePromises = flatsSnapshot.docs.map((flatDoc) =>
        deleteDoc(doc(db, "flats", flatDoc.id))
      );
      await Promise.all(deletePromises);

      // 3: Ștergem utilizatorul din colecția "users"
      await deleteDoc(doc(db, "users", selectedUserId));

      setUsers(users.filter((u) => u.id !== selectedUserId));
      toast.success("User and their flats deleted successfully.");
    } catch (error) {
      console.error("Error deleting user and their flats:", error);
      toast.error("Failed to delete user and their flats.");
    } finally {
      setShowModal(false);
      setSelectedUserId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSortChange = (e) => {
    setSortCategory(e.target.value);
  };

  const handleEditFlats = (userId) => {
    navigate(`/edit-flats/${userId}`);
  };


  const handleViewAllMessages = () => {
    navigate("/all-messages");
  };

  useEffect(() => {
    let filtered = [...users];
    if (filters.userType) {
      filtered = filtered.filter((u) =>
        filters.userType === "admin" ? u.isAdmin : !u.isAdmin
      );
    }
    filtered = filtered.filter(
      (u) => u.age >= filters.ageRange.min && u.age <= filters.ageRange.max
    );
    filtered = filtered.filter(
      (u) =>
        u.flatsCount >= filters.flatsRange.min &&
        u.flatsCount <= filters.flatsRange.max
    );

    if (sortCategory) {
      filtered.sort((a, b) => {
        if (sortCategory === "firstName" || sortCategory === "lastName") {
          return a[sortCategory].localeCompare(b[sortCategory]);
        }
        if (sortCategory === "flatsCount") {
          return b.flatsCount - a.flatsCount;
        }
        return 0;
      });
    }
    setFilteredUsers(filtered);
  }, [filters, sortCategory, users]);

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1Container}>Hi, {user?.lastName}! Here you can edit or delete users.</h1>
      <button className={styles.editButton} onClick={handleViewAllMessages}>
        See All Messages
      </button>
      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          <span>User Type:</span>
          <select name="userType" value={filters.userType} onChange={handleFilterChange} className={styles.filterInput}>
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </label>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <span>Min Age:</span>
            <input type="number" placeholder="Min Age" value={filters.ageRange.min} onChange={(e) =>
                setFilters({
                  ...filters,
                  ageRange: {
                    ...filters.ageRange,
                    min: parseInt(e.target.value || 0, 10),
                  },
                })
              }
              className={styles.filterInput}
            />
          </label>
          <label className={styles.filterLabel}>
            <span>Max Age:</span>
            <input
              type="number"
              placeholder="Max Age"
              value={filters.ageRange.max}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  ageRange: {
                    ...filters.ageRange,
                    max: parseInt(e.target.value || 120, 10),
                  },
                })
              }
              className={styles.filterInput}
            />
          </label>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <span>Min Flats:</span>
            <input
              type="number"
              placeholder="Min Flats"
              value={filters.flatsRange.min}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  flatsRange: {
                    ...filters.flatsRange,
                    min: parseInt(e.target.value || 0, 10),
                  },
                })
              }
              className={styles.filterInput}
            />
          </label>
          <label className={styles.filterLabel}>
            <span>Max Flats:</span>
            <input
              type="number"
              placeholder="Max Flats"
              value={filters.flatsRange.max}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  flatsRange: {
                    ...filters.flatsRange,
                    max: parseInt(e.target.value || 100, 10),
                  },
                })
              }
              className={styles.filterInput}
            />
          </label>
        </div>

        <label className={styles.filterLabel}>
          Sort By:
          <select
            value={sortCategory}
            onChange={handleSortChange}
            className={styles.filterInput}
          >
            <option value="">None</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="flatsCount">Flats Count</option>
          </select>
        </label>
      </div>

      <div className={styles.userTableContainer}>
  <table className={styles.userTable}>
    <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Age</th>
        <th>Is Admin</th>
        <th>Number of Flats</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.map((user) => (
        <tr key={user.id}>
          <td>{user.firstName}</td>
          <td>{user.lastName}</td>
          <td>{user.email}</td>
          <td>{user.age}</td>
          <td>{user.isAdmin ? "Yes" : "No"}</td>
          <td>{user.flatsCount}</td>
          <td>
            <div className={styles.actionButtons}>
              <button
                className={styles.editButton}
                onClick={() => handleEdit(user.id)}
              >
                Edit User
              </button>
              <button
                className={styles.editFlatsButton}
                onClick={() => handleEditFlats(user.id)}
              >
                Edit Flats
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteClick(user.id)}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this user?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      <Toaster />
    </div>
  );
};

export default AllUsers;
