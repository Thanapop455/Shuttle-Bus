  const prisma = require("../config/prisma");

  // ✅ 1. ดึงป้ายรถทั้งหมด
  exports.getBusStops = async (req, res) => {
    try {
      const busStops = await prisma.busStop.findMany();
      res.status(200).json(busStops);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ✅ 2. ดูป้ายรถตาม ID
  exports.getBusStopById = async (req, res) => {
    try {
      let { id } = req.params;
      console.log("🛠️ Received ID from request:", id);

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Bus Stop ID" });
      }

      id = parseInt(id); // ✅ แปลง id เป็นตัวเลข
      const busStop = await prisma.busStop.findUnique({
        where: { id }
      });

      if (!busStop) {
        return res.status(404).json({ error: "Bus Stop not found" });
      }

      res.json(busStop);
    } catch (err) {
      console.error("🚨 Error fetching bus stop:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  // ✅ 3. เพิ่มป้ายรถ (เฉพาะ Admin)
  exports.addBusStop = async (req, res) => {
    try {
      const { name, latitude, longitude } = req.body;

      // ✅ ตรวจสอบค่าที่รับเข้ามา
      if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Latitude and Longitude must be numbers" });
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: "Invalid latitude or longitude range" });
      }

      const newBusStop = await prisma.busStop.create({
        data: { name, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      });

      res.status(201).json({ message: "Bus stop added successfully", newBusStop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ✅ 4. แก้ไขป้ายรถ (เฉพาะ Admin)
  exports.updateBusStop = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, latitude, longitude } = req.body;

      // ✅ ตรวจสอบว่าป้ายมีอยู่จริงก่อนอัปเดต
      const existingBusStop = await prisma.busStop.findUnique({
        where: { id: Number(id) }
      });

      if (!existingBusStop) {
        return res.status(404).json({ message: "Bus stop not found" });
      }

      // ✅ ตรวจสอบค่าที่รับเข้ามา
      if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Latitude and Longitude must be numbers" });
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: "Invalid latitude or longitude range" });
      }

      const updatedBusStop = await prisma.busStop.update({
        where: { id: Number(id) },
        data: { name, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      });

      res.status(200).json({ message: "Bus stop updated", updatedBusStop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ✅ 5. ลบป้ายรถ (เฉพาะ Admin)
  exports.deleteBusStop = async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ เช็คว่าป้ายรถมีอยู่จริงไหม
      const existingBusStop = await prisma.busStop.findUnique({
        where: { id: Number(id) }
      });

      if (!existingBusStop) {
        return res.status(404).json({ message: "Bus stop not found" });
      }

      // ✅ ลบ `CheckIn` ทั้งหมดที่เกี่ยวข้องกับป้ายรถนี้ก่อน
      await prisma.checkIn.deleteMany({
        where: { busStopId: Number(id) }
      });

      // ✅ ลบป้ายรถ
      await prisma.busStop.delete({
        where: { id: Number(id) }
      });

      res.status(200).json({ message: "Bus stop and related check-ins deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
