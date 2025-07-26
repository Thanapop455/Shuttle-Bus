  const prisma = require("../config/prisma");
  const axios = require("axios");

  const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidGhhbmFwb3A0NTUiLCJhIjoiY203bm9ibTk4MDNoeTJqc2loaTE2cWxoOSJ9.v360iVmwGQrqmSgcQZW04g";

  // ✅ อัปเดตสถานะรถใน Database (แก้ไขให้ถูกต้อง)
  exports.updateStatus = async (req, res) => {
    try {
      const { driverId, status } = req.body;

      // ✅ ใช้ `bus` แทน `driver`
      const updatedBus = await prisma.bus.update({
        where: { driverId: Number(driverId) }, // 🔹 ค้นหารถที่ใช้ driverId นี้
        data: { status },
      });

      res.json({ message: "🚀 สถานะอัปเดตสำเร็จ!", updatedBus });
    } catch (err) {
      console.error("❌ updateStatus Error:", err);
      res.status(500).json({ message: "❌ อัปเดตสถานะล้มเหลว" });
    }
  };

  // ✅ ดึงเส้นทางจาก Mapbox (แก้ไขให้ชัดเจน)
  exports.getRoute = async (req, res) => {
    try {
      const { startLat, startLng, stopId } = req.query;

      // 🔹 หาพิกัดของป้ายรถจาก Database
      const busStop = await prisma.busStop.findUnique({
        where: { id: Number(stopId) }
      });

      if (!busStop) return res.status(404).json({ message: "❌ ไม่พบป้ายรถ" });

      // 🔹 เรียก Mapbox Directions API
      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${busStop.longitude},${busStop.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

      // 🔹 ดึงข้อมูลเส้นทางจาก Mapbox
      const response = await axios.get(mapboxUrl);

      if (!response.data.routes.length) {
        return res.status(404).json({ message: "❌ ไม่พบเส้นทางที่เหมาะสม" });
      }

      res.json(response.data.routes[0].geometry);
    } catch (err) {
      console.error("❌ getRoute Error:", err);
      res.status(500).json({ message: "❌ ดึงเส้นทางล้มเหลว" });
    }
  };
