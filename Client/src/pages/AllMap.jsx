import React, { useState, useEffect, useCallback, useMemo } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getBusStops } from "../api/bus-stop";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); //เชื่อมต่อกับ WebSocket Server

const AllMap = () => {
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [driverLocations, setDriverLocations] = useState({});

  const [viewport] = useState({
    latitude: 13.07,
    longitude: 99.979,
    zoom: 17,
    bearing: -30,
    pitch: 60,
  });

  const [checkInStop, setCheckInStop] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);

  // ดึงป้ายรถจาก API
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

    // ✅ ตั้งค่า WebSocket Listener
    socket.on("new-checkin", (data) => {
      console.log("🚍 แจ้งเตือนคนขับ:", data);
      toast.info(`🚍 มีคน Check-In ที่ป้าย ${data.busStopId}, จำนวน ${data.people} คน`);
    });

    return () => {
      socket.off("new-checkin");
    };
  }, []);

  //ใช้ useMemo ลด Re-render ของ Marker
  const memoizedBusStops = useMemo(() => busStops, [busStops]);

  //ใช้ useCallback ลดการสร้างฟังก์ชันใหม่
  const handleMarkerClick = useCallback((event, stop) => {
    event.originalEvent.stopPropagation();
    setSelectedStop(stop);
    setCheckInStop(stop.id);
  }, []);

  //ฟังก์ชันเปิด Popup Check-In
  const handleCheckInPopup = () => {

    const checkinData = JSON.parse(localStorage.getItem("checkinInProgress"));

    // ⏳ ถ้ามี Check-In ที่รออยู่ ไม่ให้กดซ้ำ
    if (checkinData && Date.now() - checkinData.timestamp < 10000) {
      toast.warn("⏳ คุณมี Check-In ที่รออยู่ โปรดรอให้หมดเวลาก่อน");
      return;
    }
  
    Swal.fire({
      title: "🚌 Check-In",
      html: `
        <label class="block text-lg font-semibold mb-2">เลือกป้ายรถ</label>
        <select id="busStopSelect" class="swal2-input">
          ${busStops
            .map(
              (stop) =>
                `<option value="${stop.id}" ${
                  stop.id === checkInStop ? "selected" : ""
                }>${stop.name}</option>`
            )
            .join("")}
        </select>

        <label class="block text-lg font-semibold mt-3 mb-2">จำนวนคน</label>
        <input type="number" id="passengerInput" class="swal2-input" value="${passengerCount}" min="1" />
      `,
      showCancelButton: true,
      confirmButtonText: "Check-In",
      cancelButtonText: "❌ ยกเลิก",
      confirmButtonColor: "#4CAF50",
      preConfirm: () => {
        const selectedStopId = document.getElementById("busStopSelect").value;
        const passengerInput = Number(document.getElementById("passengerInput").value);

        if (!selectedStopId) {
          Swal.showValidationMessage("กรุณาเลือกป้ายรถ");
          return false;
        }

        if (passengerInput < 1) {
          Swal.showValidationMessage("จำนวนคนต้องมากกว่า 0");
          return false;
        }

        return { busStopId: selectedStopId, people: passengerInput };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const checkinData = {
          busStopId: result.value.busStopId,
          timestamp: Date.now()
        };
      
        //บันทึกการ check-in ไว้เพื่อป้องกันซ้ำ
        localStorage.setItem("checkinInProgress", JSON.stringify(checkinData));
      
        socket.emit("passenger-checkin", {
          busStopId: result.value.busStopId,
          people: result.value.people,
        });
      
        toast.success(
          `Check-In สำเร็จ! ป้าย: ${
            busStops.find((s) => s.id == result.value.busStopId)?.name
          } | จำนวนคน: ${result.value.people}`
        );
      
        setCheckInStop(null);
      }
    });
  };

  useEffect(() => {
    const handleAccepted = (data) => {
      toast.success(data.message);
      localStorage.removeItem("checkinInProgress");
    };
  
    socket.on("checkin-accepted", handleAccepted);
  
    return () => {
      socket.off("checkin-accepted", handleAccepted);
    };
  }, []);
  

  useEffect(() => {
    const handleExpired = (data) => {
      localStorage.removeItem("checkinInProgress");
      Swal.fire({
        icon: "error",
        title: "❌ Check-In หมดเวลา",
        text: "ไม่มีคนขับรับงานของคุณ โปรดลองอีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    };
  
    socket.on("checkin-expired", handleExpired);
  
    return () => {
      socket.off("checkin-expired", handleExpired);
    };
  }, []);
  

  useEffect(() => {
    const fetchDriverLocations = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/driver-locations");
        const data = await res.json();
        setDriverLocations(data);
        console.log("🚍 Loaded driver locations:", data);
      } catch (err) {
        console.error("❌ Error fetching driver locations:", err);
      }
    };
  
    fetchDriverLocations(); // โหลดตำแหน่งเมื่อเปิดหน้า
  
    const handleDriverUpdate = (drivers) => {
      console.log("🚍 Driver location update:", drivers);
      setDriverLocations(drivers);
    };
  
    socket.on("driver-location-update", handleDriverUpdate);
  
    return () => {
      socket.off("driver-location-update", handleDriverUpdate);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center h-screen p-4">
      <h1 className="text-xl font-bold mb-4">แผนที่ป้ายรถ</h1>

      <Map
        mapboxAccessToken="pk.eyJ1IjoidGhhbmFwb3A0NTUiLCJhIjoiY203bm9ibTk4MDNoeTJqc2loaTE2cWxoOSJ9.v360iVmwGQrqmSgcQZW04g"
        initialViewState={viewport}
        style={{ width: "80vw", height: "700px", borderRadius: "10px" }}
        mapStyle="mapbox://styles/thanapop455/cm802cn7f01cr01sb4gf0b8aw"
        reuseMaps
      >
        {/* ✅ แสดงป้ายรถ */}
        {memoizedBusStops.map((stop) => (
          <Marker key={stop.id} latitude={stop.latitude} longitude={stop.longitude} onClick={(event) => handleMarkerClick(event, stop)}>
            <div className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold">
              🚌 {stop.name}
            </div>
          </Marker>
        ))}

        {/* ✅ แสดงตำแหน่งของคนขับแบบเรียลไทม์ */}
        {Object.values(driverLocations).map((driver) => (
          <Marker key={driver.driverId} latitude={driver.latitude} longitude={driver.longitude}>
            <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold">
              🚍 คนขับ
            </div>
          </Marker>
        ))}

        {selectedStop && (
          <Popup latitude={selectedStop.latitude} longitude={selectedStop.longitude} onClose={() => setSelectedStop(null)} closeOnClick closeButton anchor="top">
            <div>
              <h3 className="text-lg font-bold">{selectedStop.name}</h3>
              <p>📍 พิกัด: {selectedStop.latitude}, {selectedStop.longitude}</p>
            </div>
          </Popup>
        )}
      </Map>

      <button className="mt-4 bg-green-500 text-white px-6 py-3 rounded-md text-lg hover:bg-green-600" onClick={handleCheckInPopup}>
        Check-In
      </button>
    </div>
  );
};

export default AllMap;
