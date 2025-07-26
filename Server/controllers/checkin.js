const prisma = require("../config/prisma");

// ✅ 1. ให้ทุกคนเช็คอินได้ โดยไม่ต้องใช้ userId
exports.checkIn = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    if (!io) return res.status(500).json({ message: "❌ Server Error: WebSocket not available" });

    const { busStopId, people } = req.body;

    // ✅ ตรวจสอบว่าป้ายมีอยู่จริง
    const busStop = await prisma.busStop.findUnique({
      where: { id: Number(busStopId) },
      select: { id: true, name: true, latitude: true, longitude: true },
    });

    if (!busStop) {
      return res.status(404).json({ message: "❌ ไม่พบป้ายรถที่ Check-In" });
    }

    // ✅ บันทึกการ Check-In ลง Database
    const newCheckIn = await prisma.checkIn.create({
      data: { busStopId: busStop.id, people: Number(people), status: "waiting" },
    });

    // ✅ ค้นหา Driver ที่ว่าง
    const availableBuses = await prisma.bus.findMany({
      where: { status: "available", driverId: { not: null } },
      include: { driver: { select: { id: true, email: true } } },
    });

    if (availableBuses.length > 0) {
      availableBuses.forEach((bus) => {
        if (bus.driver) {
          io.to(`driver-${bus.driver.id}`).emit("new-checkin", {
            checkInId: newCheckIn.id,
            busStopId: busStop.id,
            busStopName: busStop.name,
            latitude: busStop.latitude,
            longitude: busStop.longitude,
            people,
          });
        }
      });
    }

    res.status(201).json({ message: "✅ Check-In สำเร็จ!", newCheckIn });
  } catch (err) {
    console.error("🚨 Check-In Error:", err);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

// ✅ 2. ดูประวัติการเช็คอินทั้งหมด
exports.getCheckIns = async (req, res) => {
  try {
    const checkIns = await prisma.checkIn.findMany({
      include: {
        busStop: { select: { id: true, name: true } },
      },
    });

    res.status(200).json(checkIns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 3. ดูเช็คอินที่ป้ายรถแต่ละจุด
exports.getCheckInsByBusStop = async (req, res) => {
  try {
    const { id } = req.params;

    const checkIns = await prisma.checkIn.findMany({
      where: { busStopId: Number(id) },
      include: {
        busStop: { select: { id: true, name: true } },
      },
    });

    res.status(200).json(checkIns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 4. ให้ Driver ตอบรับหรือปฏิเสธ Check-In
exports.respondToCheckIn = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { id } = req.params; // Check-in ID
    const { response } = req.body; // "accepted" หรือ "rejected"

    if (!req.user || req.user.role !== "driver") {
      return res.status(403).json({ message: "Access Denied: Only drivers can respond to check-ins" });
    }

    // ✅ ตรวจสอบว่า Check-in มีอยู่จริงไหม
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: Number(id) },
    });

    if (!checkIn) {
      return res.status(404).json({ message: "❌ ไม่พบ Check-in นี้" });
    }

    // ✅ ถ้าคนขับปฏิเสธ ให้เปลี่ยน `status` เป็น "rejected"
    if (response === "rejected") {
      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: Number(id) },
        data: { status: "rejected" },
      });

      return res.status(200).json({ message: "Check-in rejected", updatedCheckIn });
    }

    // ✅ ดึง `busId` ของคนขับ
    const driverBus = await prisma.bus.findFirst({
      where: { driverId: req.user.id },
    });

    if (!driverBus) {
      return res.status(400).json({ message: "❌ คุณไม่มีรถที่สามารถรับงานได้" });
    }

    // ✅ ถ้าคนขับกดรับ ให้เปลี่ยน `status` เป็น "accepted" และอัปเดต busId
    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: Number(id) },
      data: { status: "accepted", busId: driverBus.id },
    });

    console.log(`✅ Driver ${req.user.id} accepted Check-In ${id}`);

    res.status(200).json({ message: "Check-in accepted", updatedCheckIn });
  } catch (err) {
    console.error("🚨 Error responding to check-in:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
