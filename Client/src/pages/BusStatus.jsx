import React, { useEffect, useState } from "react";
import { getBuses } from "../api/bus";
import { io } from "socket.io-client";
import { FaBus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const socket = io("http://localhost:5001");

const BusStatus = () => {
  const [buses, setBuses] = useState([]);
  const [onlineDrivers, setOnlineDrivers] = useState(new Set());

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await getBuses();
        setBuses(response.data);

        const onlineDriversResponse = await fetch(
          "http://localhost:5001/api/online-drivers"
        );
        const onlineDriversData = await onlineDriversResponse.json();
        setOnlineDrivers(new Set(onlineDriversData));
      } catch (error) {
        console.error("❌ Error fetching buses:", error);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("bus-status-updated", ({ busId, status }) => {
      setBuses((prev) =>
        prev.map((bus) => (bus.id === busId ? { ...bus, status } : bus))
      );
    });

    socket.on("driver-online", (driverId) => {
      setOnlineDrivers((prev) => new Set([...prev, driverId]));
    });

    socket.on("driver-offline", (driverId) => {
      setOnlineDrivers((prev) => {
        const updated = new Set(prev);
        updated.delete(driverId);
        return updated;
      });
    });

    return () => {
      socket.off("bus-status-updated");
      socket.off("driver-online");
      socket.off("driver-offline");
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🚍 สถานะรถบัส</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center justify-center text-center border"
          >
            <FaBus className="text-4xl text-blue-500 mb-2" />
            <h2 className="text-xl font-semibold">{bus.name}</h2>

            {/* สถานะรถ */}
            <p
              className={`text-lg font-bold mt-2 px-3 py-1 rounded-full ${
                bus.status === "available"
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {bus.status === "available" ? "🟢 ว่าง" : "🔴 เต็ม"}
            </p>

            {/* คนขับ */}
            <p className="text-gray-600 mt-2">
              {bus.driver
                ? `${bus.driver.name}`
                : "❌ ไม่มีคนขับ"}
            </p>

            {/* สถานะออนไลน์ */}
            <div className="mt-3 flex items-center gap-2">
              {bus.driver && onlineDrivers.has(bus.driver.id) ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaTimesCircle className="text-red-500 text-xl" />
              )}
              <span>
                {bus.driver && onlineDrivers.has(bus.driver.id)
                  ? "ออนไลน์"
                  : "ออฟไลน์"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusStatus;
