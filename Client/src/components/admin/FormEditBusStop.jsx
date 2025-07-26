import React, { useState, useEffect } from "react";
import { getBusStopById, updateBusStop } from "../../api/bus-stop";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useMaingobal from "../../../store/maingobal";

const FormEditBusStop = () => {
  const { id } = useParams(); // รับค่า ID จาก URL
  const navigate = useNavigate();
  const token = useMaingobal((state) => state.token);
  const getBusStops = useMaingobal((state) => state.getBusStops);

  // ✅ ใช้ useState เพื่อเก็บค่าฟอร์ม
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });

  // ✅ โหลดข้อมูลป้ายรถเมื่อ component ถูก mount
  useEffect(() => {
      fetchBusStop(token, id);
  }, [id, token]);

  // ✅ ดึงข้อมูลป้ายรถจาก API ตาม ID
  const fetchBusStop = async (token, id) => {
    try {
      const res = await getBusStopById(token, id)
      console.log("res from backend", res);
      setForm(res.data)
    } catch (err){
      console.log("Err fetch data", err);
      
    }
  };

  // ✅ จัดการการเปลี่ยนแปลงในฟอร์ม
  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ ฟังก์ชันบันทึกข้อมูลที่แก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    const stopId = parseInt(id, 10);
    if (isNaN(stopId)) {
      toast.error("ID ของป้ายรถไม่ถูกต้อง");
      return;
    }

    try {
      await updateBusStop(token, stopId, {
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      toast.success("🎉 ปรับปรุงข้อมูลป้ายรถสำเร็จ!");
      getBusStops(token); // ✅ โหลดรายการป้ายรถใหม่
      navigate("/admin/busstop"); // ✅ กลับไปยังหน้ารายการป้ายรถ
    } catch (err) {
      console.error("🚨 Error updating bus stop:", err);
      toast.error("⚠️ ไม่สามารถแก้ไขป้ายรถได้");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <h1 className="text-lg font-semibold">แก้ไขป้ายรถ</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="border w-full p-2 my-2"
          value={form.name}
          onChange={handleOnChange}
          placeholder="ชื่อป้ายรถ"
          name="name"
          required
        />
        <input
          type="number"
          className="border w-full p-2 my-2"
          value={form.latitude}
          onChange={handleOnChange}
          placeholder="Latitude"
          name="latitude"
          required
        />
        <input
          type="number"
          className="border w-full p-2 my-2"
          value={form.longitude}
          onChange={handleOnChange}
          placeholder="Longitude"
          name="longitude"
          required
        />

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/busstop")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEditBusStop;
