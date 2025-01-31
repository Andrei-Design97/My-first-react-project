import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/ChatButton.module.css";
import { FaRobot } from "react-icons/fa";

const predefinedResponses = [
  { question: "How can I view my profile?", answer: "Redirecting you to your profile...", route: "/profile" },
  { question: "How can I search for flats?", answer: "Redirecting you to search for flats...", route: "/search-flats" },
  { question: "How can I edit my profile?", answer: "Redirecting you to update your profile...", route: "/update-profile" },
  { question: "How can I contact support?", answer: "You can email us at support@rentease.com.", route: null },
  { question: "What is RentEase?", answer: "RentEase helps you manage your flats and find the best places to rent.", route: null },
];

function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (response) => {
    const botMsg = { sender: "bot", text: response.answer };
    setMessages((prev) => [...prev, botMsg]);

    if (response.route) {
      setTimeout(() => {
        navigate(response.route); // Navighează către ruta specificată
        // Adaugă întrebarea pentru feedback după redirecționare
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Was this helpful? Please select Yes or No." },
        ]);
        setWaitingForFeedback(true); // Activează feedback-ul
      }, 2000);
    }
  };

  const handleFeedback = (isHelpful) => {
    const feedbackMessage = isHelpful
      ? "I'm glad I could help you😊!"
      : "I'm sorry for the inconvenience😪. Let's try again.";
    setMessages((prev) => [...prev, { sender: "bot", text: feedbackMessage }]);
    setWaitingForFeedback(false); // Resetează feedback-ul
  };

  const openChat = () => {
    setIsOpen(true);

    // Adaugă mesajul inițial al botului cu opțiunile disponibile
    const optionsMessage = {
      sender: "bot",
      text: "How can I help you? Here are some options:",
    };
    setMessages([optionsMessage]);
  };

  const closeChat = () => {
    if (waitingForFeedback) {
      setWaitingForFeedback(false); // Resetează feedback-ul dacă chat-ul este închis
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.chatWrapper}>
      {!isOpen && (
        <button className={styles.chatButton} onClick={openChat}>
          <FaRobot /> Chat
        </button>
      )}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>Chat with RentEase Bot</h3>
            <button onClick={closeChat} className={styles.closeChat}>
              Close
            </button>
          </div>
          <div className={styles.chatBody}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? styles.userMessage : styles.botMessage}
              >
                {msg.text}
              </div>
            ))}
            {!waitingForFeedback && (
              <div className={styles.options}>
                {predefinedResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(response)}
                    className={styles.optionButton}
                  >
                    {response.question}
                  </button>
                ))}
              </div>
            )}
            {waitingForFeedback && (
              <div className={styles.feedbackOptions}>
                <button
                  onClick={() => handleFeedback(true)}
                  className={styles.feedbackButton}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className={styles.feedbackButton}
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

