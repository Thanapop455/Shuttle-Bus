const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middlewares/authCheck");
const {
  getBusStops,
  getBusStopById,
  addBusStop,
  updateBusStop,
  deleteBusStop
} = require("../controllers/busStop");

// ✅ 1. ดูป้ายรถทั้งหมด (ทุกคนเข้าถึงได้)
router.get("/bus-stops", getBusStops);

// ✅ 2. ดูป้ายรถตาม ID
router.get("/bus-stops/:id", getBusStopById);

// ✅ 3. เพิ่มป้ายรถ (เฉพาะ Admin)
router.post("/bus-stops", authCheck, adminCheck, addBusStop);

// ✅ 4. แก้ไขป้ายรถ (เฉพาะ Admin)
router.put("/bus-stops/:id", authCheck, adminCheck, updateBusStop);

// ✅ 5. ลบป้ายรถ (เฉพาะ Admin)
router.delete("/bus-stops/:id", authCheck, adminCheck, deleteBusStop);

module.exports = router;
