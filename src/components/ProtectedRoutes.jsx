import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "../components/Header";

const ProtectedRoutes = ({ user, logout }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header user={user} logout={logout} />
      <Outlet />
    </>
  );
};

export default ProtectedRoutes;
