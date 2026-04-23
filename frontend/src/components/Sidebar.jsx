import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ShieldAlert,
  Users,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronUp,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "OT Scheduling", path: "/scheduling", icon: Calendar },
    { name: "Sterilization", path: "/sterilization", icon: ShieldAlert },
    { name: "Administrative Reports", path: "/reports", icon: FileText },
  ];

  if (user?.role === "Admin") {
    navItems.push({ name: "Admin Panel", path: "/admin", icon: Users });
  }

  // Default Fallback
  const avatar = `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=2563eb&color=fff`;

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800 flex flex-col h-screen shadow-[4px_0_24px_rgba(30,58,138,0.05)] z-20 transition-colors duration-300"
    >
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-[1.02]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-4 mb-4" ref={popoverRef}>
        <div className="relative">
          {/* Popover Menu */}
          <AnimatePresence>
            {showPopover && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-3 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => alert("Profile feature coming soon!")}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors text-sm font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => alert("Password flow coming soon!")}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Change Password</span>
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 mx-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors text-sm font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    <span>Secure Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </div>
    </motion.aside>
  );
}
