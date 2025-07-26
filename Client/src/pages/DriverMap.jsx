import React, { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useMaingobal from "../../store/maingobal";
import { getBuses, updateBusStatus } from "../api/bus";
import { getBusStops } from "../api/bus-stop";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

// ✅ เชื่อมต่อ WebSocket Server
const socket = io("http://localhost:5001");

const DriverMap = () => {
  const token = useMaingobal((state) => state.token);
  const user = useMaingobal((state) => state.user);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [busStatus, setBusStatus] = useState("available");
  const [busId, setBusId] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [pendingCheckIns, setPendingCheckIns] = useState([]);
  const [acceptedCheckIns, setAcceptedCheckIns] = useState([]);

  // ดึงข้อมูลป้ายรถเมื่อโหลดหน้า
  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await getBusStops();
        setBusStops(response.data);
      } catch (err) {
        console.error("🚨 Error fetching bus stops", err);
      }
    };

    fetchBusStops();
  }, []);

  //ให้คนขับเข้าห้อง WebSocket
  useEffect(() => {
    if (user && user.role === "driver") {
      socket.emit("join-driver-room", user.id);
      socket.emit("driver-online", user.id);
      console.log(`🚍 Driver ${user.id} joined WebSocket room`);
    }
  }, [user]);

  // ดึงข้อมูลรถของ Driver
  useEffect(() => {
    if (!user || user.role !== "driver") return;

    const fetchBusData = async () => {
      try {
        const res = await getBuses(token);
        const driverBus = res.data.find((bus) => bus.driverId === user.id);
        if (driverBus) {
          setBusId(driverBus.id);
          setBusStatus(driverBus.status);
        } else {
          toast.error("❌ ไม่พบรถของคุณ");
        }
      } catch (err) {
        toast.error("❌ ไม่สามารถดึงข้อมูลรถของคุณได้");
      }
    };

    fetchBusData();
  }, [user, token]);

  // ✅ ติดตามตำแหน่ง GPS และส่งไป WebSocket
  useEffect(() => {
    if (!busId || !user) return;

    let watchId;
    let lastSentLocation = null;

    // ✅ ใช้สูตร Haversine คำนวณระยะทาง (เมตร)
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371e3; // รัศมีโลก (เมตร)

      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // ผลลัพธ์เป็นเมตร
    };

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (
            !lastSentLocation ||
            haversineDistance(
              lastSentLocation.latitude,
              lastSentLocation.longitude,
              latitude,
              longitude
            ) > 5 // ✅ ขยับเกิน 5 เมตร
          ) {
            lastSentLocation = { latitude, longitude };
            setLocation({ latitude, longitude });

            socket.emit("update-location", {
              driverId: user.id,
              busId: busId,
              latitude,
              longitude,
            });

            console.log(`📡 ส่งพิกัดใหม่: ${latitude}, ${longitude}`);
          }
        },
        (error) => {
          console.error("❌ Error fetching location:", error);
          toast.error("❌ ไม่สามารถดึงตำแหน่งได้");
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("❌ อุปกรณ์ของคุณไม่รองรับการใช้ GPS");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user, busId]);

  useEffect(() => {
    socket.on("connect", () => {
      if (location.latitude && location.longitude) {
        socket.emit("update-location", {
          driverId: user.id,
          busId: busId,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        console.log("📡 Resent driver location after reconnect");
      }
    });

    return () => {
      socket.off("connect");
    };
  }, [location, busId]);

  // ✅ ฟัง Event "new-checkin" และอัปเดต UI
  useEffect(() => {
    socket.on("new-checkin", async (data) => {
      console.log("📍 Check-in event received:", data);

      if (!data.checkInId) {
        console.error("❌ Missing checkInId in new-checkin event:", data);
        return;
      }

      // ✅ ถ้ารถเต็ม (full) ไม่ต้องเพิ่ม Check-In ใหม่
      if (busStatus === "full") {
        console.log("🚫 รถเต็มแล้ว! ไม่เพิ่ม Check-In ใหม่");
        return;
      }

      const busStopName =
        busStops.find((stop) => stop.id === data.busStopId)?.name ||
        `ป้ายที่ ${data.busStopId}`;

      toast.info(
        `🚍 มีคน Check-In ที่ ${busStopName}, จำนวน ${data.people} คน`
      );

      const timeoutId = setTimeout(() => {
        setPendingCheckIns((prev) =>
          prev.filter((c) => c.checkInId !== data.checkInId)
        );

        socket.emit("checkin-expired", { checkInId: data.checkInId });

        console.log(`⌛ Check-In ${data.checkInId} หมดเวลาแล้ว`);
      }, 10000);

      setPendingCheckIns((prev) => [
        ...prev,
        {
          checkInId: data.checkInId,
          busStopId: data.busStopId,
          busStopName,
          people: data.people,
          timeoutId,
        },
      ]);
    });

    return () => {
      socket.off("new-checkin");
    };
  }, [busStops, busStatus]);

  // ✅ ฟังก์ชันกด "รับงาน"
  const handleAcceptRequest = (checkIn) => {
    if (!checkIn.checkInId) {
      console.error(
        "❌ checkInId is undefined when accepting request:",
        checkIn
      );
      toast.error("❌ ไม่สามารถรับงานได้: ไม่มี CheckIn ID");
      return;
    }

    toast.success(
      `คุณรับงานที่ ${checkIn.busStopName}, จำนวน ${checkIn.people} คน`
    );

    // ✅ ส่ง checkInId ไปยังเซิร์ฟเวอร์
    socket.emit("driver-accepted", {
      driverId: user.id,
      checkInId: checkIn.checkInId,
      busStopId: checkIn.busStopId,
      people: checkIn.people,
    });

    // 🔹 เคลียร์ Timeout ของ Check-In นี้ออกไป
    clearTimeout(checkIn.timeoutId);

    // 🔹 ลบออกจากรายการ Check-In ที่รอ
    setPendingCheckIns((prev) =>
      prev.filter((c) => c.checkInId !== checkIn.checkInId)
    );

    setAcceptedCheckIns((prev) => [
      ...prev,
      {
        checkInId: checkIn.checkInId,
        busStopId: checkIn.busStopId,
        busStopName: checkIn.busStopName,
        people: checkIn.people,
      },
    ]);
  };

  const handleRemoveAcceptedCheckIn = (checkInId) => {
    setAcceptedCheckIns((prev) =>
      prev.filter((checkIn) => checkIn.checkInId !== checkInId)
    );
    toast.info(`❌ ลบ Check-In ออกจากรายการแล้ว`);
  };

  const handleUpdateStatus = async () => {
    if (!busId) {
      toast.error("❌ ไม่พบรถของคุณ");
      return;
    }

    try {
      const newStatus = busStatus === "available" ? "full" : "available";

      await updateBusStatus(token, busId, newStatus);
      setBusStatus(newStatus);

      // ✅ แจ้งเซิร์ฟเวอร์ให้ส่งสถานะใหม่ให้ทุกไคลเอนต์
      socket.emit("update-bus-status", { busId, newStatus });

      // ✅ ถ้ารถเต็ม ต้องลบ Check-In ทั้งหมดที่รออยู่
      if (newStatus === "full") {
        setPendingCheckIns([]); // ✅ เคลียร์ Check-In ออกจากหน้าคนขับ
        socket.emit("clear-pending-checkins", { busId }); // ✅ แจ้งเซิร์ฟเวอร์ให้ Passenger รู้ว่ารถเต็มแล้ว
      }

      toast.success(
        `🚍 เปลี่ยนสถานะเป็น ${
          newStatus === "available" ? "ว่าง" : "เต็ม"
        } สำเร็จ!`
      );
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error("❌ ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  useEffect(() => {
    const handleUnload = () => {
      if (user && user.role === "driver") {
        socket.emit("driver-offline", user.id);
      }
    };

    // ✅ ฟัง Event "disconnecting" เพื่อลบคนขับเมื่อ WebSocket ปิด
    socket.on("disconnecting", () => {
      if (user && user.role === "driver") {
        socket.emit("driver-offline", user.id);
      }
    });

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      socket.off("disconnecting");
    };
  }, [user]);

  useEffect(() => {
    const handleCheckInRemoved = ({ checkInId }) => {
      setPendingCheckIns((prev) =>
        prev.filter((c) => c.checkInId !== checkInId)
      );
      console.log(`🧹 ลบ Check-In ${checkInId} ที่ถูกคนขับคนอื่นรับ`);
    };

    socket.on("checkin-removed", handleCheckInRemoved);

    return () => {
      socket.off("checkin-removed", handleCheckInRemoved);
    };
  }, []);

  return (
    <div className="flex flex-col items-center h-screen p-4">
      <h1 className="text-xl font-bold mb-4">📍 ตำแหน่งปัจจุบันของคุณ</h1>

      {location.latitude && location.longitude ? (
        <Map
          mapboxAccessToken="pk.eyJ1IjoidGhhbmFwb3A0NTUiLCJhIjoiY203bm9ibTk4MDNoeTJqc2loaTE2cWxoOSJ9.v360iVmwGQrqmSgcQZW04g"
          initialViewState={{
            latitude: location.latitude,
            longitude: location.longitude,
            zoom: 15,
          }}
          style={{ width: "80vw", height: "600px", borderRadius: "10px" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          {/* ✅ แสดงป้ายรถของคนขับ */}
          {busStops.map((stop) => (
            <Marker
              key={stop.id}
              latitude={stop.latitude}
              longitude={stop.longitude}
            >
              <div className="bg-blue-500 text-white px-2 py-1 rounded shadow-md">
                🚌 {stop.name}
              </div>
            </Marker>
          ))}

          {/* ✅ แสดงตำแหน่งของคนขับ */}
          <Marker latitude={location.latitude} longitude={location.longitude}>
            <div className="bg-red-500 text-white px-2 py-1 rounded shadow-md">
              🚍 คุณอยู่ที่นี่
            </div>
          </Marker>
        </Map>
      ) : (
        <p>⏳ กำลังโหลดตำแหน่ง...</p>
      )}

      {/* ✅ ปุ่มเปลี่ยนสถานะรถ */}
      <button
        className={`mt-4 px-6 py-3 rounded-md text-lg shadow-md ${
          busStatus === "available"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
        onClick={handleUpdateStatus} // ✅ เรียกฟังก์ชันอัปเดตสถานะ
      >
        {busStatus === "available"
          ? "🟢 รถว่าง - กดเพื่อเปลี่ยนเป็นเต็ม"
          : "🔴 รถเต็ม - กดเพื่อเปลี่ยนเป็นว่าง"}
      </button>

      {pendingCheckIns.length > 0 && (
        <div className="mt-4 w-full max-w-lg bg-white p-4 shadow-md rounded-md">
          <h2 className="text-lg font-bold mb-2">
            🚌 Check-Ins ที่รอการตอบรับ
          </h2>
          {pendingCheckIns.map((checkIn, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border-b"
            >
              <p>
                📍 ป้าย: {checkIn.busStopName} | 👥 {checkIn.people} คน
              </p>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => handleAcceptRequest(checkIn)}
              >
                ✅ รับงาน
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex w-full p-4 overflow-y-hidden">
        {/* ✅ Check-Ins ที่รับแล้ว (ชิดซ้าย) */}
        <div className="w-full md:w-1/3 bg-white p-4 shadow-md rounded-md ml-4 max-h-[300px] overflow-y-auto">
          <h2 className="text-lg font-bold mb-2 flex items-center">
            ✅ Check-Ins ที่รับแล้ว
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {acceptedCheckIns.length > 0 ? (
              acceptedCheckIns.map((checkIn, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between bg-green-50 border border-green-300 p-2 rounded-md shadow-md"
                >
                  <p className="text-sm font-semibold text-gray-700">
                    📍 {checkIn.busStopName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    👥 {checkIn.people} คน
                  </p>
                  <button
                    className="bg-red-500 text-white text-xs px-3 py-1 rounded mt-2 self-end"
                    onClick={() =>
                      handleRemoveAcceptedCheckIn(checkIn.checkInId)
                    }
                  >
                    ❌ ยกเลิก
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">ยังไม่มี Check-In ที่รับ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
