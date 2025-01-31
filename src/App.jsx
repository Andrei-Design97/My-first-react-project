import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import UpdateProfile from "./pages/UpdateProfile";
import MyFlats from "./pages/MyFlats";
import Footer from "./components/Footer";
import AllUsers from "./pages/AllUsers";
import EditUser from "./pages/EditUser";
import SearchFlats from "./pages/SearchFlats";
import EditFlat from "./pages/EditFlat";
import EditFlats from "./pages/AdminEditFlats";
import FlatDetails from "./pages/FlatDetails";
import FavouriteFlats from "./pages/FavouriteFlats";
import LeaveMessage from "./pages/LeaveMessage";
import DeleteAccount from "./pages/DeleteAccount";
import NotFound from "./pages/NotFound";
import AutoLogout from "./components/AutoLogout";
import AllMessages from "./pages/AllMessages";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ChatButton from "./components/ChatButton";
import Popup from "./components/Popup";
import CookieConsent from "./components/CookieConsent";
import { CursorifyProvider, DefaultCursor } from "@cursorify/react";
import { PhingerCursor, EmojiCursor } from "@cursorify/cursors";
import "./index.css";
import PrivacyPolicy from "./components/PrivacyPolicy";
import RateUs from "./components/RateUs";

const App = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(() => {
    return localStorage.getItem("cookiesAccepted") === "true";
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showChatBot, setShowChatBot] = useState(() => {
    const storedChatBot = localStorage.getItem("showChatBot");
    return storedChatBot === "true";
  });
  const [showRateUs, setShowRateUs] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (cookiesAccepted && user) {
      setTimeout(() => {
        setShowPopup(true);
      }, 5000); // Afișează popup-ul la 5 secunde după acceptarea cookie-urilor
    }
  }, [cookiesAccepted, user]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setShowRateUs(true); // Afișează RateUs la 5 secunde după autentificare
      }, 5000);
    } else {
      setShowRateUs(false);
    }
  }, [user]);

  const handleAcceptCookies = () => {
    setCookiesAccepted(true);
    localStorage.setItem("cookiesAccepted", "true");
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    setTimeout(() => {
      setShowChatBot(true);
      localStorage.setItem("showChatBot", "true");
    }, 3000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setShowPopup(false);
    setShowChatBot(false);
    setShowRateUs(false);
    localStorage.removeItem("showChatBot");
    localStorage.removeItem("cookiesAccepted");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CursorifyProvider cursor={<PhingerCursor />} opacity={0.8} delay={1} defaultCursorVisible={false} breakpoint={997}>
      <BrowserRouter>
        {user && <AutoLogout logout={logout} />}
        {!cookiesAccepted && (
          <CookieConsent onAccept={handleAcceptCookies} />
        )}
        {cookiesAccepted && showPopup && <Popup onClose={() => setShowPopup(false)} />}
        {showChatBot && <ChatButton />}
        {showRateUs && <RateUs />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setUser={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoutes user={user} logout={logout} />}>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/profile" element={<MyProfile email={user?.email} />} />
            <Route path="/update-profile" element={<UpdateProfile user={user} />} />
            <Route path="/my-flats" element={<MyFlats user={user} />} />
            <Route path="/all-users" element={<AllUsers user={user} />} />
            <Route path="/all-messages" element={<AllMessages user={user} />} />
            <Route path="/edit-user/:userId" element={<EditUser />} />
            <Route path="/search-flats" element={<SearchFlats user={user} />} />
            <Route path="/edit-flat/:flatId" element={<EditFlat />} />
            <Route path="/edit-flats/:userId" element={<EditFlats />} />
            <Route path="/flat-details/:flatId" element={<FlatDetails />} />
            <Route path="/favourites" element={<FavouriteFlats user={user} />} />
            <Route path="/leave-message/:flatId" element={<LeaveMessage user={user} />} />
            <Route path="/delete-account" element={<DeleteAccount user={user} logout={logout} />} />
          </Route>
          
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CursorifyProvider>
  );
};

export default App;
