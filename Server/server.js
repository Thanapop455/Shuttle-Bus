const prisma = require("./config/prisma");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(cors());

//สร้าง HTTP Server และ WebSocket Server
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

//เก็บสถานะออนไลน์ของคนขับ
let onlineDrivers = new Set();
let driverLocations = {}; //ประกาศตัวแปรให้พร้อมใช้

io.on("connection", (socket) => {
  console.log("🔗 A driver connected:", socket.id);

  //ให้ Driver เข้าห้อง "available" ถ้ารถเขาว่าง
  socket.on("join-driver-room", async (driverId) => {
    if (!driverId) return;

    const driverBus = await prisma.bus.findFirst({
      where: { driverId: driverId },
      select: { status: true },
    });

    if (driverBus && driverBus.status === "available") {
      socket.join("available-drivers");
      console.log(`🚍 Driver ${driverId} joined room: available-drivers`);
    }
  });

  //ฟัง Event "คนขับออนไลน์"
  socket.on("driver-online", (driverId) => {
    onlineDrivers.add(driverId);
    io.emit("driver-online", driverId);
    console.log(`✅ Driver ${driverId} is now online`);
  });

  //ฟัง Event "คนขับออฟไลน์"
  socket.on("driver-offline", (driverId) => {
    onlineDrivers.delete(driverId);
    io.emit("driver-offline", driverId);
    console.log(`❌ Driver ${driverId} is now offline`);

    //ลบตำแหน่งคนขับออกจาก `driverLocations`
    if (driverLocations[driverId]) {
        delete driverLocations[driverId];
        io.emit("driver-location-update", driverLocations);
        console.log(`🛑 Removed driver ${driverId} from map`);
    }
});


  let checkInTimeouts = {}; // 🔹 Key: Check-In ID, Value: Timeout ID

  socket.on("passenger-checkin", async (data) => {
    console.log("🛑 Passenger Check-In Event:", data);

    try {
      const newCheckIn = await prisma.checkIn.create({
        data: {
          busStopId: Number(data.busStopId),
          people: Number(data.people),
          status: "waiting",
        },
      });

      io.to("available-drivers").emit("new-checkin", {
        checkInId: newCheckIn.id,
        busStopId: newCheckIn.busStopId,
        people: newCheckIn.people,
      });

      console.log(`✅ New Check-In created with ID: ${newCheckIn.id}`);

      //ตั้ง Timeout 1 นาที
      checkInTimeouts[newCheckIn.id] = setTimeout(async () => {
        const checkIn = await prisma.checkIn.findUnique({
          where: { id: newCheckIn.id },
        });

        if (checkIn && checkIn.status === "waiting") {
          await prisma.checkIn.delete({ where: { id: newCheckIn.id } });

          io.emit("checkin-removed", { checkInId: newCheckIn.id });
          io.emit("checkin-expired", {
            checkInId: newCheckIn.id,
            message: `❌ ไม่มีคนขับรับ Check-In ของคุณ โปรดลองใหม่อีกครั้ง!`,
          });

          console.log(`⌛ Check-In ${newCheckIn.id} หมดเวลาแล้ว ไม่มีคนขับรับ`);
        }

        delete checkInTimeouts[newCheckIn.id]; //ลบ Timeout ออกจาก Object
      }, 10000); // ⏳ 1 นาที
    } catch (error) {
      console.error("❌ Error creating check-in:", error);
    }
  });

  //เมื่อ Driver กดรับ Check-In
  socket.on("driver-accepted", async (data) => {
    console.log(
      `✅ Driver ${data.driverId} accepted Check-In ${data.checkInId}`
    );

    if (!data.checkInId) {
      console.error("❌ Error: checkInId is undefined");
      return;
    }

    try {
      const driverBus = await prisma.bus.findFirst({
        where: { driverId: data.driverId },
        select: { id: true },
      });

      if (!driverBus) {
        console.error("❌ Error: Driver does not have a bus assigned.");
        return;
      }

      const checkIn = await prisma.checkIn.findUnique({
        where: { id: data.checkInId },
        select: { status: true },
      });

      if (!checkIn) {
        console.error("❌ Error: Check-In not found.");
        return;
      }

      if (checkIn.status !== "waiting") {
        console.warn(
          `⚠️ Check-In ${data.checkInId} has already been accepted!`
        );
        return;
      }

      await prisma.checkIn.update({
        where: { id: data.checkInId },
        data: { status: "accepted", busId: driverBus.id },
        
      });

      // ✅ ถ้ามี Timeout ให้ลบออก
      if (checkInTimeouts[data.checkInId]) {
        clearTimeout(checkInTimeouts[data.checkInId]);
        delete checkInTimeouts[data.checkInId];
        console.log(
          `✅ Timeout for Check-In ${data.checkInId} has been cleared`
        );
      }

      io.emit("checkin-removed", { checkInId: data.checkInId });

      io.emit("checkin-accepted", {
        checkInId: data.checkInId,
        message: `🚍 คนขับรับ Check-In ของคุณแล้ว!`,
      });

      console.log(
        `✅ Check-In ${data.checkInId} assigned to Bus ${driverBus.id}`
      );
    } catch (error) {
      console.error("❌ Error updating check-in:", error);
    }
  });

// ✅ ฟัง Event "update-location" จากคนขับ
socket.on("update-location", (data) => {
  console.log(`📍 Driver ${data.driverId} moved to`, data.latitude, data.longitude);

  // ✅ บันทึกพิกัดของคนขับใน `driverLocations`
  driverLocations[data.driverId] = {
    driverId: data.driverId,
    busId: data.busId,
    latitude: data.latitude,
    longitude: data.longitude,
    socketId: socket.id,
  };

  // ✅ ส่งพิกัดไปยังทุก Passenger (WebSocket Broadcast)
  io.emit("driver-location-update", driverLocations);
});

  // ✅ อัปเดตสถานะรถบัส (🚍 Available / 🔴 Full)
  socket.on("update-bus-status", async ({ busId, newStatus }) => {
    try {
        await prisma.bus.update({
            where: { id: busId },
            data: { status: newStatus },
        });

        io.emit("bus-status-updated", { busId, status: newStatus });

        console.log(`🚍 Bus ${busId} updated to ${newStatus}`);

        // ✅ ถ้ารถเต็ม (full) → ลบ Check-In ที่รออยู่
        if (newStatus === "full") {
            await prisma.checkIn.deleteMany({
                where: { status: "waiting", busId: null },
            });

            io.emit("clear-pending-checkins", { busId });
            console.log(`❌ ลบ Check-In ที่รอทั้งหมดสำหรับรถ ${busId}`);
        }
    } catch (error) {
        console.error("❌ Error updating bus status:", error);
    }
});


  socket.on("disconnect", () => {
    console.log("❌ A driver disconnected:", socket.id);

    // ✅ หา driverId ที่เกี่ยวข้อง
    const driverIdToRemove = Object.keys(driverLocations).find(
        (id) => driverLocations[id].socketId === socket.id
    );

    if (driverIdToRemove) {
        delete driverLocations[driverIdToRemove];
        io.emit("driver-location-update", driverLocations);
        console.log(`🛑 Removed disconnected driver ${driverIdToRemove} from map`);
    }
});

});

// ✅ API ให้ `BusStatus.js` ใช้ดึงสถานะออนไลน์ของคนขับ
app.get("/api/online-drivers", (req, res) => {
  res.json([...onlineDrivers]); // ✅ ส่งเป็น Array แทน Set
});

app.get("/api/driver-locations", (req, res) => {
  res.json(Object.values(driverLocations)); // ✅ ส่งพิกัดที่เก็บอยู่
});

// ✅ ให้ Controller อื่นสามารถใช้ `io` ได้
app.set("socketio", io);

// ✅ โหลด Routes อัตโนมัติ
readdirSync("./routes").forEach((c) => {
  app.use("/api", require(`./routes/${c}`));
});

// ✅ ใช้ `server.listen(...)` แทน `app.listen(...)`
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
