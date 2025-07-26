const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
      },
    });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    if (!id || enabled === undefined) {
      return res.status(400).json({ message: "Missing required fields: id or enabled" });
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled },
    });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listDrivers = async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: "driver" }, // ✅ ดึงเฉพาะผู้ใช้ที่เป็นคนขับ
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json(drivers);
  } catch (err) {
    console.error("Error fetching drivers:", err);
    res.status(500).json({ message: "Server Error" });
  }
};