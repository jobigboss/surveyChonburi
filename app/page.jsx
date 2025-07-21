"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const foremostBlue = "#0094E5";
const foremostOrange = "#FF9100";
const darkText = "#222";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // สมมติ username คือ user_id
    // เรียก API login (POST)
    try {
      const res = await fetch("/api/servey/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: username, user_password: password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError("Username หรือ Password ไม่ถูกต้อง");
        return;
      }

      // ตรวจ role & redirect
      const { role, user_id } = data.user;
      if (role === "admin") {
        router.push(`/admin?user_id=${user_id}`);
      } else if (role === "member") {
        router.push(`/survey?user_id=${user_id}`);
      } else if (role === "customer") {
        router.push(`/customer?user_id=${user_id}`);
      } else {
        setError("ไม่พบ role นี้ในระบบ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F6F7FA]"
      style={{
        fontFamily: "'Nunito', 'Prompt', 'Inter', sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-10 space-y-8 border border-[#e8e8e8]"
        aria-label="เข้าสู่ระบบ"
      >
        <div className="flex flex-col items-center gap-2 mb-1">
          <img
            src="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
            alt="Foremost Logo"
            className="w-20 h-20 mb-2"
          />
          <h2 className="text-2xl font-black text-[#0094E5] tracking-tight">เข้าสู่ระบบ</h2>
        </div>
        {error && (
          <div className="text-sm text-red-600 font-semibold text-center bg-red-50 rounded p-2">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-bold text-[#0094E5] mb-1">
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border-2 border-[#0094E5] bg-[#F6F7FA] px-3 py-2 text-base focus:outline-none focus:border-[#FF9100] focus:ring-2 focus:ring-[#FF9100] transition"
            placeholder="กรอก Username"
            style={{ color: darkText }}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-[#0094E5] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-[#0094E5] bg-[#F6F7FA] px-3 py-2 pr-12 text-base focus:outline-none focus:border-[#FF9100] focus:ring-2 focus:ring-[#FF9100] transition"
              placeholder="กรอก Password"
              style={{ color: darkText }}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[#0094E5] hover:text-[#FF9100] transition"
            >
              {showPassword ? (
                <EyeOff size={22} strokeWidth={2.1} />
              ) : (
                <Eye size={22} strokeWidth={2.1} />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#FF9100] hover:bg-[#ffac38] text-white rounded-xl py-2 text-lg font-extrabold shadow-md hover:brightness-110 active:scale-95 transition"
        >
          เข้าสู่ระบบ
        </button>
        <div className="text-xs text-[#0094E5]/80 text-center pt-2 font-semibold">
          © {new Date().getFullYear()} Foremost Thailand
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
