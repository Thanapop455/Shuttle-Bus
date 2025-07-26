const express = require("express");
const router = express.Router();
const { authCheck, adminCheck, driverCheck } = require("../middlewares/authCheck");
const {
  checkIn,
  getCheckIns,
  getCheckInsByBusStop,
  respondToCheckIn
} = require("../controllers/checkin");

// ✅ 1. ผู้ใช้เช็คอินที่ป้ายรถ
router.post("/check-in", checkIn);  

// ✅ 2. ดูประวัติการเช็คอินทั้งหมด
router.get("/check-ins", authCheck, adminCheck, getCheckIns);

// ✅ 3. ดูเช็คอินที่ป้ายรถแต่ละจุด
router.get("/check-ins/bus-stop/:id", authCheck, driverCheck, getCheckInsByBusStop);

router.put("/check-in/:id/respond", authCheck, driverCheck, respondToCheckIn);

module.exports = router;
