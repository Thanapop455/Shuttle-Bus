const express = require("express");
const router = express.Router();
const { updateStatus, getRoute } = require("../controllers/driver");

// ✅ อัปเดตสถานะรถ (แก้ path เพื่อให้ใช้ driverId)
router.put("/driver/status/:driverId", updateStatus);

// ✅ ดึงเส้นทางจาก Mapbox
router.get("/route", getRoute);

module.exports = router;
