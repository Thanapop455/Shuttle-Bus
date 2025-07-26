import React, { useState, useEffect } from "react";
import { addBusStop, deleteBusStop, getBusStops } from "../../api/bus-stop";
import { Link } from "react-router-dom";
import useMaingobal from "../../../store/maingobal";
import { LucideTrash, PencilLine, Trash, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const initialState = {
  name: "",
  latitude: "",
  longitude: "",
};

const FormBusStop = () => {
  const token = useMaingobal((state) => state.token);
  const getBusStopsFromStore = useMaingobal((state) => state.getBusStops);
  const busstops = useMaingobal((state) => state.busstops)
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    getBusStopsFromStore(token)
  }, []);



  // ✅ จัดการการเปลี่ยนแปลงในฟอร์ม
  const handleOnChange = (e) => {
    console.log(e.target.name, e.target.value);
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ ฟังก์ชันเพิ่มป้ายรถใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addBusStop(token, {
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      toast.success(`เพิ่มป้ายรถ "${res.data.newBusStop.name}" สำเร็จ!`);
      setForm(initialState);
      getBusStops(token)
      getBusStopsFromStore(token);
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      toast.error("ไม่สามารถเพิ่มป้ายรถได้!");
    }
  };

  // ✅ ฟังก์ชันลบป้ายรถ
  const handleDelete = async (id) => {
    Swal.fire({
      title: "⚠️ ยืนยันการลบ?",
      text: "คุณต้องการลบป้ายรถนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "🗑️ ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteBusStop(token, id);
          toast.success("ป้ายรถถูกลบเรียบร้อย!");
          getBusStopsFromStore(token);
        } catch (err) {
          console.error("เกิดข้อผิดพลาด:", err);
          toast.error("ลบป้ายรถไม่สำเร็จ!");
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <form onSubmit={handleSubmit}>
        <h1>เพิ่มป้ายรถใหม่</h1>
        <input
          className="border"
          value={form.name}
          onChange={handleOnChange}
          placeholder="ชื่อป้ายรถ"
          name="name"
        />
        <input
          type="number"
          className="border"
          value={form.latitude}
          onChange={handleOnChange}
          placeholder="Latitude"
          name="latitude"
        />
        <input
          type="number"
          className="border"
          value={form.longitude}
          onChange={handleOnChange}
          placeholder="Longitude"
          name="longitude"
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600">
          เพิ่มป้ายรถ
        </button>
      </form>

      <hr />
      <br />

      {/* ✅ แสดงรายการป้ายรถ */}
      <table className="table border-separate border-spacing-2 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">No.</th>
            <th className="px-4 py-2">ชื่อป้าย</th>
            <th className="px-4 py-2">Latitude</th>
            <th className="px-4 py-2">Longitude</th>
            <th className="px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {busstops.map((stop, index) => (
            <tr key={stop.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-center">{index + 1}</td>
              <td className="px-4 py-2">{stop.name}</td>
              <td className="px-4 py-2 text-center">{stop.latitude}</td>
              <td className="px-4 py-2 text-center">{stop.longitude}</td>
              <td className="px-4 py-2 flex justify-around">
              <p className="bg-green-400 text-white px-3 py-1 rounded-md 
            hover:scale-105 hover:-translate-y-1 hover:duration-200 shadow-md">
              <Link to={`/admin/busstop/${stop.id}`}>
              <PencilLine />
              </Link>
            </p>
                <p
                  className="bg-red-400 text-white px-3 py-1 rounded-md hover:scale-105 hover:-translate-y-1 hover:duration-200 shadow-md"
                  onClick={() => handleDelete(stop.id)}
                >
                  🗑️ ลบ
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormBusStop;
