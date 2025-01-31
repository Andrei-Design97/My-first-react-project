import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./styles/AllMessages.module.css";

const AllMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, "messages");
        const querySnapshot = await getDocs(messagesRef);
        const messagesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages.");
      }
    };

    fetchMessages();
  }, []);

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      setMessages(messages.filter((message) => message.id !== messageId));
      toast.success("Message deleted successfully.");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>All Messages</h1>
      <table className={styles.messageTable}>
        <thead>
          <tr>
            <th>Sender</th>
            <th>Flat ID</th>
            <th>Message</th>
            <th>Sent on</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.senderName}</td>
              <td>{message.flatId}</td>
              <td>{message.message}</td>
              <td>{message.createdAt}</td>
              <td>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Toaster />
    </div>
  );
};

export default AllMessages;
