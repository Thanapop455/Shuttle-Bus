const prisma = require("../config/prisma");

// ✅ 1. ดึงข้อมูลรถทั้งหมด
exports.getBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: { 
        driver: { 
          select: { id: true, name: true, email: true } 
        } 
      },
    });
    res.status(200).json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ 2. ดูข้อมูลรถแต่ละคัน
exports.getBusById = async (req, res) => {
  try {
    const { id } = req.params;
    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
      include: { driver: { select: { id: true, name: true, email: true } } },
    });

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 3. เพิ่มรถใหม่ (เฉพาะ Admin)
exports.addBus = async (req, res) => {
  try {
    const { name } = req.body;
    
    const newBus = await prisma.bus.create({
      data: { name, status: "available" },
    });

    res.status(201).json({ message: "Bus added successfully", newBus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 4. อัปเดตสถานะรถ (เฉพาะ Driver)
exports.updateBusStatus = async (req, res) => {
  try {
      console.log("🔹 User:", req.user);
      console.log("🔹 Params:", req.params);
      console.log("🔹 Body:", req.body);

      const { id } = req.params; // ค่าจาก URL
      const { status } = req.body; // ค่าจาก Body

      if (!req.user || req.user.role !== "driver") {
          return res.status(403).json({ message: "Access Denied: Only drivers can update bus status" });
      }

      // ✅ ตรวจสอบว่า Driver ID ตรงกับ Bus หรือไม่
      const bus = await prisma.bus.findUnique({
          where: { id: Number(id) },
      });

      if (!bus || bus.driverId !== req.user.id) {
          return res.status(403).json({ message: "Access Denied: This is not your bus" });
      }

      // ✅ อัปเดตสถานะของรถบัส
      const updatedBus = await prisma.bus.update({
          where: { id: Number(id) },
          data: { status },
      });

      res.status(200).json({ message: "Bus status updated", updatedBus });
  } catch (err) {
      console.error("🚨 Error updating bus status:", err);
      res.status(500).json({ message: "Server Error" });
  }
};


// ✅ 5. กำหนดคนขับให้รถ (เฉพาะ Admin)
exports.assignDriver = async (req, res) => {
  try {
    const { id } = req.params;  
    let { driverId } = req.body;  

    if (driverId === null || driverId === "null" || driverId === "") {
      const updatedBus = await prisma.bus.update({
        where: { id: Number(id) },
        data: { driverId: null },
        include: { driver: { select: { id: true, name: true, email: true } } }
      });

      return res.status(200).json({
        message: "ลบคนขับออกจากรถเรียบร้อยแล้ว",
        updatedBus,
      });
    }

    // ✅ แปลง driverId ให้เป็น Number
    driverId = Number(driverId);
    if (isNaN(driverId) || driverId <= 0) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    // ✅ ตรวจสอบว่าคนขับมีอยู่จริง
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!driver || driver.role !== "driver") {
      return res.status(400).json({ message: "Driver not found or invalid role" });
    }

    // ✅ ตรวจสอบว่ารถบัสมีอยู่จริง
    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // ✅ ตรวจสอบว่าคนขับไม่ได้ถูกกำหนดให้รถคันอื่นแล้ว
    const existingBusWithDriver = await prisma.bus.findFirst({
      where: { driverId: driverId }
    });

    if (existingBusWithDriver) {
      return res.status(400).json({ message: "This driver is already assigned to another bus" });
    }

    // ✅ อัปเดตรถให้มีคนขับ
    const updatedBus = await prisma.bus.update({
      where: { id: Number(id) },
      data: { driverId },
      include: { driver: { select: { id: true, name: true, email: true } } }
    });

    res.status(200).json({
      message: "Driver assigned to bus",
      updatedBus
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


  // ✅ 6. ลบรถบัส (เฉพาะ Admin)
exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ ตรวจสอบว่ารถมีอยู่จริงหรือไม่
    const bus = await prisma.bus.findUnique({ where: { id: Number(id) } });
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // ✅ ลบรถออกจากฐานข้อมูล
    await prisma.bus.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

  
  exports.updateBusLocation = async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      // ✅ อัปเดตพิกัดของรถใน Database
      const updatedBus = await prisma.bus.update({
        where: { id: Number(id) },
        data: { latitude, longitude },
      });
  
      // ✅ ส่งตำแหน่งไปยัง Passenger ผ่าน WebSocket
      const io = req.app.get("io");
      io.emit("bus-location-update", { id, latitude, longitude });
  
      res.status(200).json({ message: "Bus location updated", updatedBus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
  