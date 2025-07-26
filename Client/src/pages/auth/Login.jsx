import React, { useState } from "react";
import { toast } from "react-toastify";
import useMaingobal from "../../../store/maingobal";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Javascript
  const navigate = useNavigate();
  const actionLogin = useMaingobal((state) => state.actionLogin);
  const user = useMaingobal((state) => state.user);
  console.log("user form zustand", user);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role = res.data.payload.role;
      roleRedirect(role);
      toast.success("Welcome Back");
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.message;
      toast.error(errMsg);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "driver") {
      navigate("/driver");  // ✅ เพิ่มให้คนขับไปที่ /driver
    } else {
      navigate("/"); // ✅ เปลี่ยนค่า default ให้ไปหน้าแรกแทน
    }
  };
  

  return (
    <div
      className="min-h-screen flex 
  items-center justify-center bg-gray-100"
    >
      <div className="w-full shadow-md bg-white p-8 max-w-md ">
        <h1 className="text-2xl text-center my-4 font-bold ">Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              placeholder="Email"
              className="border w-full px-3 py-2 rounded
            focus:outline-none focus:ring-2 focus:ring-green-500
            focus:border-transparent"
              onChange={handleOnChange}
              name="email"
              type="email"
            />

            <input
              placeholder="Password"
              className="border w-full px-3 py-2 rounded
                    focus:outline-none focus:ring-2 focus:ring-green-500
                    focus:border-transparent"
              onChange={handleOnChange}
              name="password"
              type="password"
            />
            <button
              className="bg-green-500 rounded-md
             w-full text-white font-bold py-2 shadow
             hover:bg-green-700
             "
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;