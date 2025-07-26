const express = require("express");
const {
  getBuses,
  getBusById,
  addBus,
  updateBusStatus,
  assignDriver,
  deleteBus,
} = require("../controllers/bus");
const { authCheck, adminCheck, driverCheck } = require("../middlewares/authCheck");

const router = express.Router();

// ✅ ดูรถทั้งหมด (User, Driver, Admin ใช้ได้)
router.get("/buses", getBuses);

// ✅ ดูข้อมูลรถแต่ละคัน
router.get("/buses/:id", authCheck, getBusById);

// ✅ เพิ่มรถใหม่ (เฉพาะ Admin)
router.post("/buses", authCheck, adminCheck, addBus);

// ✅ Driver อัปเดตสถานะรถ
router.put("/buses/:id/status", authCheck, driverCheck, updateBusStatus);

// ✅ Admin กำหนด Driver ให้รถ
router.put("/buses/:id/assign-driver", authCheck, adminCheck, assignDriver);

router.delete("/buses/:id", authCheck, adminCheck, deleteBus);


module.exports = router;
