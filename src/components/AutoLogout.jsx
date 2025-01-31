import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AutoLogout = ({ user, logout }) => {
  const navigate = useNavigate();
  const LOGOUT_TIME =  60 * 60 * 1000; 

  useEffect(() => {
    const logoutTimer = setTimeout(() => {
      logout();
      localStorage.removeItem("user");
      toast.error("You have been logged out after 60 minutes of inactivity.");
      navigate("/login");
    }, LOGOUT_TIME);

    return () => {
      clearTimeout(logoutTimer); 
    };
  }, [logout, navigate]);

  return null; 
};

export default AutoLogout;
