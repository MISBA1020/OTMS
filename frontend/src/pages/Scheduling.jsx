import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal";

export default function Scheduling() {
  const [surgeries, setSurgeries] = useState([]);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/surgeries");
      setSurgeries(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/surgeries/${id}`, { status });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCancelSchedule = async (id) => {
    const confirmed = window.confirm("Cancel this scheduled operation?");
    if (!confirmed) return;

    await handleStatusChange(id, "Cancelled");
    setMenuOpenFor(null);
  };

  const handleOpenReschedule = (surgery) => {
    setSelectedSurgery(surgery);
    setShowRescheduleModal(true);
    setMenuOpenFor(null);
  };

  const handleRescheduleModalVisibility = (visible) => {
    setShowRescheduleModal(visible);
    if (!visible) {
      setSelectedSurgery(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
          Scheduling Calendar
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
          Manage and track daily surgical operations
        </p>
      </div>

      <div className="overflow-x-auto overflow-y-visible pb-10">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide transition-colors">
            <tr>
              <th className="px-6 pb-2 font-semibold">Patient / Surgeon</th>
              <th className="px-6 pb-2 font-semibold">Theatre</th>
              <th className="px-6 pb-2 font-semibold">Type</th>
              <th className="px-6 pb-2 font-semibold">Timing</th>
              <th className="px-6 pb-2 font-semibold">Status</th>
              <th className="px-6 pb-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {surgeries.map((surgery, index) => {
              const openUpwards = index >= surgeries.length - 2;

              return (
                <tr
                  key={surgery._id}
                  className="glass-panel dark:bg-slate-900 shadow-sm border border-transparent dark:border-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  <td className="px-6 py-5 rounded-l-3xl">
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-base">
                      {surgery.patientName}
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold text-xs flex items-center mt-1">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {surgery.surgeonName}
                    </p>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-700 dark:text-slate-300">
                    {surgery.operationTheatreId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-500 dark:text-gray-400">
                    {surgery.surgeryCategory}
                  </td>
                  <td className="px-6 py-5 border-l-0">
                    <div className="flex items-center text-gray-800 dark:text-slate-200 font-semibold mb-1">
                      <CalendarIcon className="w-4 h-4 mr-2 text-primary-500 shrink-0" />{" "}
                      {format(new Date(surgery.startTime), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Clock className="w-4 h-4 mr-2 shrink-0" />{" "}
                      <span>{format(new Date(surgery.startTime), "HH:mm")} -{" "}
                      {format(new Date(surgery.endTime), "HH:mm")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                        surgery.status === "Scheduled"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
                          : surgery.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                            : surgery.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"
                              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800/50 dark:text-gray-300 dark:border-slate-700"
                      }`}
                    >
                      {surgery.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 rounded-r-3xl">
                    {surgery.status === "Scheduled" && (
                      <div className="relative flex items-center justify-end">
                        <button
                          onClick={() =>
                            handleStatusChange(surgery._id, "In Progress")
                          }
                          className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold mr-3 shadow-sm transition-colors"
                        >
                          Start OP
                        </button>
                        {/* if OT in use and the user tries to start another Operation give alert that the OT is already in use */}
                        <button
                          onClick={() =>
                            setMenuOpenFor((prev) =>
                              prev === surgery._id ? null : surgery._id,
                            )
                          }
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenFor === surgery._id && (
                          <div
                            className={`absolute right-0 z-20 min-w-40 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden ${
                              openUpwards ? "bottom-11" : "top-11"
                            }`}
                          >
                            <button
                              onClick={() => handleOpenReschedule(surgery)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:bg-slate-700 hover:bg-gray-50"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelSchedule(surgery._id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/30 hover:bg-rose-50"
                            >
                              Cancel Schedule
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {surgery.status === "In Progress" && (
                      <button
                        onClick={() =>
                          handleStatusChange(surgery._id, "Completed")
                        }
                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold mr-3 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {surgeries.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 font-medium glass-panel dark:bg-slate-900 border dark:border-slate-800 rounded-3xl"
                >
                  No surgeries scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ScheduleModal
        showModal={showRescheduleModal}
        setShowModal={handleRescheduleModalVisibility}
        onSuccess={fetchData}
        mode="edit"
        editSurgeryId={selectedSurgery?._id}
        initialData={selectedSurgery}
      />
    </div>
  );
}
