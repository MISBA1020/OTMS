import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-primary-100 selection:text-primary-900 relative overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 md:p-12 overflow-y-auto relative w-full h-[calc(100vh-80px)]">
          <div className="max-w-7xl mx-auto pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}
