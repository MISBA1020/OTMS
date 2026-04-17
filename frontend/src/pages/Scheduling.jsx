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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Scheduling Calendar
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and track daily surgical operations
        </p>
      </div>

      <div className="overflow-x-auto overflow-y-visible pb-10">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead className="text-gray-500 font-medium text-sm tracking-wide">
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
                  className="glass-panel hover:-translate-y-1 transition-all duration-300"
                >
                  <td className="px-6 py-5 rounded-l-3xl">
                    <p className="font-bold text-gray-900 text-base">
                      {surgery.patientName}
                    </p>
                    <p className="text-primary-600 font-semibold text-xs flex items-center mt-1">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {surgery.surgeonName}
                    </p>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-700">
                    {surgery.operationTheatreId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-500">
                    {surgery.surgeryCategory}
                  </td>
                  <td className="px-6 py-5 border-l-0">
                    <div className="flex items-center text-gray-800 font-semibold mb-1">
                      <CalendarIcon className="w-4 h-4 mr-2 text-primary-500 shrink-0" />{" "}
                      {format(new Date(surgery.startTime), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Clock className="w-4 h-4 mr-2 shrink-0" />{" "}
                      <span>{format(new Date(surgery.startTime), "HH:mm")} -{" "}
                      {format(new Date(surgery.endTime), "HH:mm")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                        surgery.status === "Scheduled"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : surgery.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : surgery.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
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
                          className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold mr-3 shadow-sm transition-colors"
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
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenFor === surgery._id && (
                          <div
                            className={`absolute right-0 z-20 min-w-40 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden ${
                              openUpwards ? "bottom-11" : "top-11"
                            }`}
                          >
                            <button
                              onClick={() => handleOpenReschedule(surgery)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelSchedule(surgery._id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
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
                  className="px-6 py-16 text-center text-gray-500 font-medium glass-panel rounded-3xl"
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
