import React, { useEffect, useState, useContext } from "react";
import { Activity, Beaker, CheckCircle, AlertCircle, Search, PlusCircle, User, X, Eye, Package, ShieldAlert, Zap, Truck } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal";
import { AuthContext } from "../context/AuthContext";

const STATUS_COLORS = {
  Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "In Use": "bg-red-100 text-red-800 border-red-200",
  Sterilizing: "bg-purple-100 text-purple-800 border-purple-200",
  Maintenance: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [ots, setOts] = useState([]);
  const [activeSurgeries, setActiveSurgeries] = useState([]);
  const [cssdSets, setCssdSets] = useState([]);
  const [cssdCompleted, setCssdCompleted] = useState([]);
  const [selectedActiveSurgery, setSelectedActiveSurgery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchOTs();
    const interval = setInterval(fetchOTs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOTs = async () => {
    try {
      const [otsRes, surgeriesRes, cssdRes, cssdCompletedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/ots"),
        axios.get("http://localhost:5000/api/surgeries"),
        axios.get("http://localhost:5000/api/sterilization-sets"),
        axios.get("http://localhost:5000/api/sterilization-sets?completedOnly=true"),
      ]);

      const now = new Date();
      const allSurgeries = surgeriesRes.data;

      const updatedOts = otsRes.data.map((ot) => {
        const active = allSurgeries.find(
          (s) =>
            (s.operationTheatreId?._id || s.operationTheatreId) === ot._id &&
            s.status !== "Completed" &&
            s.status !== "Cancelled" &&
            (s.status === "In Progress" ||
              (new Date(s.startTime) <= now && new Date(s.endTime) > now)),
        );
        return {
          ...ot,
          status: active
            ? "In Use"
            : ot.status === "In Use"
              ? "Available"
              : ot.status,
        };
      });

      setOts(updatedOts);
      setActiveSurgeries(allSurgeries);
      setCssdSets(cssdRes.data);
      setCssdCompleted(cssdCompletedRes.data);
    } catch (err) {
      console.error("Failed to fetch OTs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOts = ots.filter(
    (ot) =>
      ot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ot.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = [
    {
      name: "Available",
      value: ots.filter((ot) => ot.status === "Available").length,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      name: "In Use",
      value: ots.filter((ot) => ot.status === "In Use").length,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      name: "Sterilizing",
      value: ots.filter((ot) => ot.status === "Sterilizing").length,
      icon: Beaker,
      color: "text-purple-500",
    },
    {
      name: "Maintenance",
      value: ots.filter((ot) => ot.status === "Maintenance").length,
      icon: AlertCircle,
      color: "text-rose-500",
    },
  ];

  const cssdStats = [
    {
      name: "Sterilizing",
      value: cssdSets.filter((s) => s.status === "Sterilizing").length,
      icon: Zap,
      color: "text-amber-500",
    },
    {
      name: "Ready (Stored)",
      value: cssdSets.filter((s) => s.status === "Stored" || s.status === "Sterile").length,
      icon: Package,
      color: "text-emerald-500",
    },
    {
      name: "Issued to OT",
      value: cssdSets.filter((s) => s.status === "Issued").length,
      icon: Truck,
      color: "text-purple-500",
    },
    {
      name: "Expired / Failed",
      value: cssdSets.filter((s) => s.status === "Expired" || s.status === "Failed").length,
      icon: ShieldAlert,
      color: "text-red-500",
    },
    {
      name: "Completed Cycles",
      value: cssdCompleted.length,
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-8 relative">


      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors">
            Live Status Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            Real-time monitoring of all {ots.length} Operation Theatres
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 transition-colors" />
            <input
              type="text"
              placeholder="Search theatres, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm transition-colors placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Schedule Operation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={stat.name}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl p-6 flex items-center justify-between hover:-translate-y-1 transition-all cursor-default"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 ${stat.color}`}
              >
                <Icon className="w-8 h-8" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors mt-8">
        CSSD Operations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {cssdStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={stat.name}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl p-6 flex items-center justify-between hover:-translate-y-1 transition-all cursor-default"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 ${stat.color}`}
              >
                <Icon className="w-8 h-8" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors mt-8 mb-4">
        Live OT Status
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center text-gray-400">
            Loading OT Status...
          </div>
        ) : (
          filteredOts.map((ot, index) => {
            const otSurgeries = activeSurgeries.filter(
              (s) =>
                (s.operationTheatreId?._id || s.operationTheatreId) ===
                  ot._id &&
                s.status !== "Completed" &&
                s.status !== "Cancelled",
            );
            const now = new Date();
            const active =
              otSurgeries.find(
                (s) =>
                  s.status === "In Progress" ||
                  (new Date(s.startTime) <= now && new Date(s.endTime) > now),
              ) || otSurgeries[0];

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={ot._id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-default"
              >
                {/* Left Side: Name and Details */}
                <div className="flex flex-col justify-start flex-grow mb-5">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {ot.name}
                  </h3>

                  <div className="mt-2 space-y-1">
                    {ot.lastMaintained && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-1">Last Sterilized:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {new Date(ot.lastMaintained).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Status AND Action Button */}
                <div className="flex flex-col items-end gap-3 shrink-0 sm:min-w-[140px]">
                  <span
                    className={`px-3 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${STATUS_COLORS[ot.status] || "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300"}`}
                  >
                    {ot.status}
                  </span>

                  {active && (
                    <button
                      onClick={() => setSelectedActiveSurgery(active)}
                      className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-3 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm flex justify-center items-center text-xs group mt-1"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                      View Details
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        {!loading && filteredOts.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            No Operation Theatres found matching your search.
          </div>
        )}
      </div>

      <ScheduleModal
        showModal={showScheduleModal}
        setShowModal={setShowScheduleModal}
        onSuccess={fetchOTs}
      />

      {selectedActiveSurgery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl shadow-indigo-900/20 dark:shadow-black/50 border border-gray-100 dark:border-slate-800 relative transition-colors"
          >
            <button
              onClick={() => setSelectedActiveSurgery(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse outline outline-4 outline-blue-100 dark:outline-blue-900/50"></div>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-widest transition-colors">
                Live Operation Data
              </span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight capitalize transition-colors">
              {selectedActiveSurgery.patientName}
            </h2>

            <div className="flex gap-2 mt-2 font-bold mb-6">
              <span className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs transition-colors">
                UHID: {selectedActiveSurgery.uhid}
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs transition-colors">
                IP: {selectedActiveSurgery.ipNumber || "N/A"}
              </span>
              <span className="bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs transition-colors">
                {selectedActiveSurgery.surgeryCategory}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl flex items-center shadow-sm glass-panel border-gray-200 transition-colors">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl shadow-sm mr-4 transition-colors">
                  <Beaker className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5 transition-colors">
                    Surgical Procedure
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white transition-colors">
                    {selectedActiveSurgery.surgery}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Lead Surgeon
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white flex items-start text-sm transition-colors">
                    <User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" />{" "}
                    {selectedActiveSurgery.surgeonName}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Anesthesiologist
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white flex items-start text-sm transition-colors">
                    <User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" />{" "}
                    {selectedActiveSurgery.anesthesiologist}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Scrub Nurse
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white flex items-start text-sm transition-colors">
                    <User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" />{" "}
                    {selectedActiveSurgery.scrubNurse}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    OT Technician
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white flex items-start text-sm transition-colors">
                    <User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" />{" "}
                    {selectedActiveSurgery.otTechnician}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl shadow-sm flex-1 border border-blue-100 dark:border-blue-900/50 transition-colors">
                  <p className="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Commenced
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white transition-colors">
                    {new Date(
                      selectedActiveSurgery.startTime,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/20 p-4 rounded-2xl shadow-sm flex-1 border border-purple-100 dark:border-purple-900/50 transition-colors">
                  <p className="text-xs text-purple-500 dark:text-purple-400 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Anesthesia
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white transition-colors">
                    {selectedActiveSurgery.anaesthesiaType}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
