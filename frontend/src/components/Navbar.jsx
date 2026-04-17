import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
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

  // Default Fallback
  const avatar = `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=2563eb&color=fff`;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="w-full bg-white border-b border-gray-200 shadow-sm relative z-50"
    >
      <div className="max-w-full px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img
            src="pes logo1.png"
            alt="PES"
            className="w-12 h-12 rounded-full"
          />
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            PESU Hospitals
          </span>
        </div>

        {/* Interactive Profile Badge */}
        <div ref={popoverRef} className="relative">
          <AnimatePresence>
            {showPopover && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => alert("Profile feature coming soon!")}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => alert("Password flow coming soon!")}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Change Password</span>
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-sm font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Secure Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Badge Button */}
          <button
            onClick={() => setShowPopover(!showPopover)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between shadow-sm cursor-pointer gap-3 ${
              showPopover
                ? "bg-primary-50 border-primary-200 shadow-primary-500/10"
                : "bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200/50 hover:border-primary-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center space-x-2">
              <img
                src={avatar}
                alt="Profile"
                className="w-9 h-9 rounded-full shadow-sm flex-shrink-0"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                  {user?.name}
                </p>
                <p className="text-xs text-secondary-600 font-semibold truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                showPopover ? "rotate-180 text-primary-600" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
