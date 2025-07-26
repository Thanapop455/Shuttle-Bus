import React, { useState, useEffect } from "react";
import { getBuses, addBus, assignDriver, deleteBus } from "../../api/bus";
import { getDrivers } from "../../api/user";
import useMaingobal from "../../../store/maingobal";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { PencilLine, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const FormBusManage = () => {
  const token = useMaingobal((state) => state.token);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "" });

  // ✅ บันทึกค่าคนขับก่อนหน้าแต่ละ busId
  const [selectedDrivers, setSelectedDrivers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busRes, driverRes] = await Promise.all([
        getBuses(token),
        getDrivers(token),
      ]);
      setBuses(busRes.data);
      setDrivers(driverRes.data);

      // ✅ ตั้งค่า dropdown ให้มีค่าตาม driver ปัจจุบันของแต่ละรถ
      const driverMapping = {};
      busRes.data.forEach((bus) => {
        driverMapping[bus.id] = bus.driver ? bus.driver.id.toString() : "";
      });
      setSelectedDrivers(driverMapping);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const res = await addBus(token, { name: form.name });
      toast.success(`เพิ่มรถบัส "${res.data.newBus.name}" สำเร็จ!`);
      setForm({ name: "" });
      fetchData(); // ✅ โหลดข้อมูลใหม่หลังเพิ่มรถบัส
    } catch (err) {
      console.error("Error adding bus:", err);
      toast.error("ไม่สามารถเพิ่มรถบัสได้");
    }
  };

  const handleDeleteBus = async (id) => {
    Swal.fire({
      title: "⚠️ ยืนยันการลบ?",
      text: "คุณต้องการลบรถบัสนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "🗑️ ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBus(token, id);
          toast.success("ลบรถบัสเรียบร้อยแล้ว!");
          fetchData();
        } catch (err) {
          console.error("Error deleting bus:", err);
          toast.error("ลบรถบัสไม่สำเร็จ!");
        }
      }
    });
  };

  const handleAssignDriver = async (busId, driverId) => {
    try {
      if (!driverId) {
        toast.error("กรุณาเลือกคนขับ");
        return;
      }

      if (driverId === "null") {
        const res = await assignDriver(token, busId, null); // ส่ง null ไป backend
        toast.success("เอาคนขับออกจากรถสำเร็จ");
        fetchData();
        return;
      }

      const numericDriverId = Number(driverId);
      if (isNaN(numericDriverId)) {
        toast.error("รหัสคนขับไม่ถูกต้อง");
        return;
      }

      // ✅ บันทึกค่าก่อนหน้าของ dropdown
      setSelectedDrivers((prev) => ({
        ...prev,
        [busId]: driverId,
      }));

      const response = await assignDriver(token, busId, numericDriverId);

      if (response.status === 400) {
        throw new Error(response.data.message);
      }

      toast.success("กำหนดคนขับสำเร็จ!");
      fetchData();
    } catch (err) {
      console.error("Error assigning driver:", err);
      toast.error("กำหนดคนขับไม่สำเร็จ");

      // ✅ ถ้า error ให้คืนค่า dropdown เป็นค่าก่อนหน้า
      setSelectedDrivers((prev) => ({
        ...prev,
        [busId]: buses.find((bus) => bus.id === busId)?.driver?.id.toString() || "",
      }));
    }
  };

  if (loading) {
    return <p className="text-center">⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <h1 className="text-lg font-semibold">จัดการรถบัส</h1>

      {/* ✅ เพิ่มฟอร์มสำหรับเพิ่มรถบัส */}
      <form onSubmit={handleAddBus} className="mb-4">
        <input
          className="border w-full p-2 my-2"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="ชื่อรถบัส"
          required
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600">
          เพิ่มรถบัส
        </button>

      </form>

      <hr />
      <br />

      <table className="table border-separate border-spacing-2 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">No.</th>
            <th className="px-4 py-2">ชื่อรถบัส</th>
            <th className="px-4 py-2">สถานะ</th>
            <th className="px-4 py-2">คนขับ</th>
            <th className="px-4 py-2">กำหนดคนขับ</th>
            <th className="px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus, index) => (
            <tr key={bus.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-center">{index + 1}</td>
              <td className="px-4 py-2">{bus.name}</td>
              <td className="px-4 py-2 text-center">{bus.status}</td>

              {/* ✅ ตรวจสอบค่าคนขับ */}
              <td className="px-4 py-2 text-center">
                {bus.driver && bus.driver.name
                  ? `${bus.driver.name} (${bus.driver.email})`
                  : "ไม่มีคนขับ"}
              </td>

              <td className="px-4 py-2">
                <select
                  className="border p-1"
                  value={selectedDrivers[bus.id] || ""}
                  onChange={(e) => handleAssignDriver(bus.id, e.target.value)}
                >
                  <option value="" disabled>
                    เลือกคนขับ
                  </option>
                  <option value="null">
                    ❌เอาคนขับออก
                    </option> 
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-4 py-2 flex justify-around">
                <p
                  className="bg-red-400 text-white px-3 py-1 rounded-md hover:scale-105 hover:-translate-y-1 hover:duration-200 shadow-md"
                  onClick={() => handleDeleteBus(bus.id)}
                >
                  <Trash2 />
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormBusManage;
