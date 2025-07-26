import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { FolderKanban } from "lucide-react";
import { Users } from "lucide-react";
import { BusFront } from "lucide-react";
import { MapPlus } from "lucide-react";
import { LogOut } from "lucide-react";
import useMaingobal from "../../../store/maingobal";

const SidebarAdmin = () => {
  const logout = useMaingobal((state) => state.logout); // ดึงฟังก์ชัน logout จาก Zustand
  const navigate = useNavigate(); // ใช้ navigate เพื่อเปลี่ยนหน้า

  const handleLogout = () => {
    logout();
    localStorage.removeItem("SadStore"); // ล้างค่า persist storage
    navigate("/foodsearch"); // ส่งกลับไปยังหน้า Login
  };
  return (
    <div
      className="bg-green-500 w-64 text-gray-100 flex 
    flex-col h-screen"
    >
      <div
        className="h-24 bg-green-600 flex items-center
      justify-center text-2xl fon-bold"
      >
        Admin Panel
      </div>

      <div className="flex-1 px-4 py-4 space-y-2">
        <NavLink
          to={"/admin"}
          end
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <LayoutDashboard className="mr-2" />
          Dashboard
        </NavLink>

        <NavLink
          to={"manage"}
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <Users className="mr-2" />
          Manage
        </NavLink>

        <NavLink
          to={"bus"}
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <BusFront className="mr-2" />
          Bus Manage
        </NavLink>

        <NavLink
          to={"busstop"}
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <MapPlus className="mr-2" />
          BusStop Manage
        </NavLink>

        <NavLink
          to={"register"}
          end
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <FolderKanban className="mr-2" />
          Register
        </NavLink>
      </div>

      <footer>
        <NavLink
          onClick={handleLogout}
          className={({ isActive }) =>
            isActive
              ? "bg-green-600 rounded-md text-white px-4 py-2 flex items-center"
              : "text-white-500 px-4 py-2 hover:bg-green-700 hover:text-white rounded flex items-center"
          }
        >
          <LogOut className="mr-2" />
          Logout
        </NavLink>
      </footer>
    </div>
  );
};

export default SidebarAdmin;
