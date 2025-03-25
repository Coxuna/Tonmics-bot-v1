import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./components/shared/NavBar";

export default function AppLayout() {
  return (
    <div>
      <div>
        <Outlet /> {/* This will render the child routes */}
      </div>
      <BottomNav />
    </div>
  );
}
