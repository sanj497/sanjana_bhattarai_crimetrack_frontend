import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import React from "react";
import { useSocket } from "../../hooks/useSocket.js";

const SOSList = () => {
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const socket = useSocket();

  // ================= FETCH =================
  const fetchSOS = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSosData(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [page, limit]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!socket) return;

    socket.on("new_sos_alert", (alert) => {
      // ✅ Add new alert on top (page 1 only)
      if (page === 1) {
        setSosData(prev => [alert, ...prev.slice(0, limit - 1)]);
      }
    });

    return () => {
      socket.off("new_sos_alert");
    };
  }, [socket, page, limit]);

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ================= UI =================
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-8">

      {/* ===== LIST ===== */}
      <div className="grid gap-4">
        {sosData.map((item) => (
          <div key={item._id} className="bg-slate-900 p-4 rounded-xl">
            <h3 className="text-white font-bold">
              {item.userId?.name || "Unknown"}
            </h3>

            <p className="text-gray-400 text-sm">
              {item.userId?.email}
            </p>

            <p className="text-gray-300 mt-2">
              {item.message}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="flex justify-center items-center gap-3 mt-10">

        {/* Prev */}
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-40"
        >
          Prev
        </button>

        {/* Numbers */}
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-2 rounded ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-gray-400"
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* ===== RANGE INFO ===== */}
      <p className="text-center text-sm text-gray-400 mt-4">
        Showing {(page - 1) * limit + 1} -{" "}
        {Math.min(page * limit, total)} of {total} alerts
      </p>

    </div>
  );
};

export default SOSList;