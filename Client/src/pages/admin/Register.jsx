import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";
import { useForm } from "react-hook-form";

// ✅ เพิ่มการตรวจสอบฟิลด์ name
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "ชื่อของคุณต้องมีอย่างน้อย 2 ตัวอักษร" }),
    email: z.string().email({ message: "Invalid email!!!" }),
    password: z.string().min(8, { message: "Password ต้องมากกว่า 8 ตัวอักษร" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

const Register = () => {
  const [passwordScore, setPasswordScore] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", // ✅ เพิ่มค่าเริ่มต้นของชื่อ
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validatePassword = () => {
    let password = watch().password;
    return zxcvbn(password ? password : "").score;
  };

  useEffect(() => {
    setPasswordScore(validatePassword());
  }, [watch().password]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5001/api/register", data);

      console.log(res.data);
      toast.success("✅ ลงทะเบียนสำเร็จ!");
      reset();
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาด";
      toast.error(errMsg);
      console.log(err);
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
          📝 สมัครสมาชิก
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ชื่อ */}
          <div>
            <label className="block font-semibold mb-1">ชื่อ</label>
            <input
              {...register("name")}
              placeholder="กรอกชื่อ"
              className={`w-full border px-4 py-2 rounded focus:ring-2 focus:outline-none ${
                errors.name ? "border-red-500 ring-red-200" : "ring-green-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* อีเมล */}
          <div>
            <label className="block font-semibold mb-1">อีเมล</label>
            <input
              {...register("email")}
              placeholder="you@example.com"
              className={`w-full border px-4 py-2 rounded focus:ring-2 focus:outline-none ${
                errors.email ? "border-red-500 ring-red-200" : "ring-green-200"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block font-semibold mb-1">รหัสผ่าน</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`w-full border px-4 py-2 rounded focus:ring-2 focus:outline-none ${
                errors.password
                  ? "border-red-500 ring-red-200"
                  : "ring-green-200"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Password Strength */}
            {watch().password && (
              <div className="flex mt-2 gap-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-2 rounded ${
                      index < passwordScore
                        ? passwordScore < 3
                          ? "bg-red-500"
                          : passwordScore < 4
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="block font-semibold mb-1">ยืนยันรหัสผ่าน</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              className={`w-full border px-4 py-2 rounded focus:ring-2 focus:outline-none ${
                errors.confirmPassword
                  ? "border-red-500 ring-red-200"
                  : "ring-green-200"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition duration-150"
          >
            ✅ สมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
