import React, { useState, useEffect } from "react";
import { getListAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import useMaingobal from "../../../store/maingobal";
import { toast } from "react-toastify";

const TableUsers = () => {
  const token = useMaingobal((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null); // ใช้เพื่อล็อคปุ่มของผู้ใช้ที่กำลังอัปเดต

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleGetUsers = async () => {
    setLoading(true);
    try {
      const res = await getListAllUsers(token);
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserStatus = async (userId, userStatus) => {
    try {
      setUpdatingUserId(userId); // ล็อคปุ่มเฉพาะของผู้ใช้ที่อัปเดต
      const value = { id: userId, enabled: !userStatus };
      await changeUserStatus(token, value);
      toast.success(`${!userStatus ? "Enabled" : "Disabled"} User Success!`);
      await handleGetUsers();
    } catch (err) {
      console.error(" Error updating status:", err);
      toast.error("Failed to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleChangeUserRole = async (userId, userRole) => {
    try {
      setUpdatingUserId(userId);
      const value = { id: userId, role: userRole };
      await changeUserRole(token, value);
      toast.success("Update Role Success!");
      await handleGetUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-md">
      {loading && <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>}
      <table className="table-fixed w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="w-1/12 text-left px-4 py-2">ลำดับ</th>
            <th className="w-3/12 text-left px-4 py-2">Email</th>
            <th className="w-2/12 text-left px-4 py-2">สิทธิ์</th>
            <th className="w-2/12 text-left px-4 py-2">สถานะ</th>
            <th className="w-2/12 text-left px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((el, i) => (
              <tr key={el.id} className="border-t">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{el.email}</td>
                <td className="px-4 py-2">
                  <select
                    onChange={(e) => handleChangeUserRole(el.id, e.target.value)}
                    value={el.role}
                    className="border p-1 rounded-md w-full"
                    disabled={updatingUserId === el.id}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="driver">driver</option>
                  </select>
                </td>
                <td className="px-4 py-2">{el.enabled ? "Active" : "Inactive"}</td>
                <td className="px-4 py-2">
                  <button
                    className={`px-3 py-1 rounded-md shadow-md text-white transition ${
                      el.enabled
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={() => handleChangeUserStatus(el.id, el.enabled)}
                    disabled={updatingUserId === el.id} // ล็อคปุ่มเฉพาะของผู้ใช้ที่กำลังอัปเดต
                  >
                    {updatingUserId === el.id ? "กำลังอัปเดต..." : el.enabled ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-4">
                ไม่มีข้อมูลผู้ใช้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableUsers;
