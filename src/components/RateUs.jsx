import React, { useState } from "react";
import { doc, collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./styles/RateUs.module.css";
import toast from "react-hot-toast";

const RateUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") {
      alert("Please provide both a rating and a comment.");
      return;
    }

    try {
      await addDoc(collection(db, "ratings"), {
        rating,
        comment,
        timestamp: new Date(),
      });
      toast.success("Thank you for your feedback!");
      setRating(0);
      setComment("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving feedback: ", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.rateUsWrapper}>
      {!isOpen && (
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(true)}
        >
          ◀
        </button>
      )}
      {isOpen && (
        <div className={styles.rateUsForm}>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            ✖
          </button>
          <h3>Rate Us😍</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Rating:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={0}>Select...</option>
                <option value={1}>1 - Poor😪</option>
                <option value={2}>2 - Fair😥</option>
                <option value={3}>3 - Good😄</option>
                <option value={4}>4 - Very Good😁</option>
                <option value={5}>5 - Excellent😍</option>
              </select>
            </label>
            <label>
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your feedback..."
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RateUs;