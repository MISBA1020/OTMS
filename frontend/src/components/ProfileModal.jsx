import React, { useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Lock, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function ProfileModal({ onClose, initialTab = "profile" }) {
  const { user, updateUser } = useContext(AuthContext);
  const [tab, setTab] = useState(initialTab); // 'profile' | 'password'

  // Profile tab state
  const [name, setName] = useState(user?.name || "");
  const [profileStatus, setProfileStatus] = useState(null); // { type: 'success'|'error', msg }
  const [profileLoading, setProfileLoading] = useState(false);

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim())
      return setProfileStatus({ type: "error", msg: "Name cannot be empty." });
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      const res = await axios.put("http://localhost:5000/api/auth/profile", {
        name,
      });
      updateUser({ name: res.data.name });
      setProfileStatus({
        type: "success",
        msg: "Profile updated successfully!",
      });
    } catch (err) {
      setProfileStatus({
        type: "error",
        msg: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return setPasswordStatus({
        type: "error",
        msg: "New passwords do not match.",
      });
    if (newPassword.length < 6)
      return setPasswordStatus({
        type: "error",
        msg: "Password must be at least 6 characters.",
      });
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      await axios.put("http://localhost:5000/api/auth/password", {
        currentPassword,
        newPassword,
      });
      setPasswordStatus({
        type: "success",
        msg: "Password changed successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({
        type: "error",
        msg: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=2563eb&color=fff&size=128`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-900/15 dark:shadow-slate-950/50 w-full max-w-md border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-700 to-indigo-900 px-8 pt-10 pb-10 text-white shrink-0 overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-5">
              <img
                src={avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl shrink-0 bg-indigo-800"
              />
              <div className="flex flex-col text-left pt-1">
                <p className="text-2xl font-black tracking-tight">{user?.name}</p>
                <span className="text-xs font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full mt-2 w-fit border border-white/10 backdrop-blur-sm shadow-sm">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Decorative Aesthetic Right Side */}
            <div className="hidden sm:flex items-center justify-center pl-4 pr-6 select-none pointer-events-none transform -rotate-12 opacity-80 mix-blend-overlay hover:rotate-0 hover:opacity-100 hover:mix-blend-normal hover:scale-110 transition-all duration-500 cursor-default">
              <span className="text-[4.5rem] drop-shadow-xl filter">
                {user?.role === 'Admin' ? '🛡️' : '🩺'}
              </span>
            </div>
          </div>

          {/* Decorative background shapes for premium look */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 -mt-px relative z-10 bg-white dark:bg-slate-900 shrink-0 transition-colors">
          {["profile", "password"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                tab === t
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t === "profile" ? (
                <User className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {t === "profile" ? "My Profile" : "Change Password"}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="wait">
            {tab === "profile" ? (
              <motion.form
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleProfileSave}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-800 dark:text-white transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username}
                    disabled
                    className="w-full border border-gray-100 dark:border-slate-700/50 rounded-xl px-4 py-3 bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 font-medium cursor-not-allowed transition-colors"
                  />
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 transition-colors">
                    Username cannot be changed.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                    className="w-full border border-gray-100 dark:border-slate-700/50 rounded-xl px-4 py-3 bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 font-medium cursor-not-allowed transition-colors"
                  />
                </div>

                {profileStatus && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${profileStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                  >
                    {profileStatus.type === "success" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {profileStatus.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handlePasswordChange}
                className="space-y-5"
              >
                {[
                  {
                    label: "Current Password",
                    value: currentPassword,
                    set: setCurrentPassword,
                    show: showCurrent,
                    toggle: () => setShowCurrent((p) => !p),
                  },
                  {
                    label: "New Password",
                    value: newPassword,
                    set: setNewPassword,
                    show: showNew,
                    toggle: () => setShowNew((p) => !p),
                  },
                  {
                    label: "Confirm New Password",
                    value: confirmPassword,
                    set: setConfirmPassword,
                    show: showConfirm,
                    toggle: () => setShowConfirm((p) => !p),
                  },
                ].map(({ label, value, set, show, toggle }) => (
                  <div key={label}>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        required
                        className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-800 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                      >
                        {show ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {passwordStatus && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${passwordStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                  >
                    {passwordStatus.type === "success" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {passwordStatus.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-secondary-500 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
