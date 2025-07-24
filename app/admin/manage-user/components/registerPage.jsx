"use client";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage({ onClose }) {
  const [formData, setFormData] = useState({
    user_id: "",
    user_password: "",
    user_first_name: "",
    user_last_name: "",
    user_tel: "",
    role: "member",
    route: ""
  });
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (formData.role === "member") {
      fetch("/api/servey/get/routes")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRoutes(data.routes);
        })
        .catch((err) => console.error(err));
    }
  }, [formData.role]);

  const handleRegister = async () => {
    const { user_id, user_password, user_first_name, user_last_name, role, route } = formData;

    if (!user_id || !user_password || !user_first_name || !user_last_name) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (role === "member" && !route) {
      alert("กรุณาเลือกโซนสำหรับ Member");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/servey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.message);
      } else {
        alert("✅ เพิ่มพนักงานสำเร็จ");
        setFormData({
          user_id: "",
          user_password: "",
          user_first_name: "",
          user_last_name: "",
          user_tel: "",
          role: "member",
          route: ""
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        name="user_id"
        placeholder="Username"
        className="w-full border rounded-2xl p-3"
        value={formData.user_id}
        onChange={handleChange}
      />
      <input
        type="password"
        name="user_password"
        placeholder="Password"
        className="w-full border rounded-2xl p-3"
        value={formData.user_password}
        onChange={handleChange}
      />
      <input
        type="text"
        name="user_first_name"
        placeholder="ชื่อ"
        className="w-full border rounded-2xl p-3"
        value={formData.user_first_name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="user_last_name"
        placeholder="นามสกุล"
        className="w-full border rounded-2xl p-3"
        value={formData.user_last_name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="user_tel"
        placeholder="เบอร์โทร (ถ้ามี)"
        className="w-full border rounded-2xl p-3"
        value={formData.user_tel}
        onChange={handleChange}
      />

      {/* เลือก Role */}
      <select
        name="role"
        className="w-full border rounded-2xl p-3"
        value={formData.role}
        onChange={handleChange}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>

      {formData.role === "member" && (
        <select
          name="route"
          className="w-full border rounded-2xl p-3"
          value={formData.route}
          onChange={handleChange}
        >
          <option value="">-- เลือก Route --</option>
          {routes.map((r, i) => (
            <option key={i} value={r}>{r}</option>
          ))}
        </select>
      )}

      {/* ปุ่ม */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-1/2 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-2xl"
        >
          ยกเลิก
        </button>
        <button
          className={`w-1/2 flex justify-center items-center text-white font-semibold py-3 rounded-2xl ${
            isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              กำลังเพิ่ม...
            </>
          ) : (
            "บันทึกข้อมูล"
          )}
        </button>
      </div>
    </div>
  );
}
