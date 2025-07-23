"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useSearchParams } from "next/navigation";

const COLORS = {
  blue: "#0094E5",
  orange: "#FF9100",
  dark: "#222",
  gray: "#ececec",
  logout: "#D32F2F",
};

function SurveyMenu() {
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");

  // กรณีไม่มี user_id ให้ redirect หรือแสดงข้อความ
  const [user, setUser] = useState({ user_first_name: "DEMO", user_last_name: "DEMO" });
  const [loading, setLoading] = useState(!!user_id);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!user_id) return;
    setLoading(true);
    setFetchError("");
    fetch(`/api/servey/get/user?user_id=${user_id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
        const data = await res.json();
        setUser(data?.[0] || { user_first_name: "Unknown", user_last_name: "" });
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [user_id]);

  // --- UI ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] px-4">
      <div className="w-full max-w-[370px] bg-white shadow-2xl rounded-[32px] p-8 flex flex-col items-center gap-4">

        {/* โลโก้ */}
        <img
          src="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png"
          alt="Foremost Logo"
          className="w-20 h-20 object-contain rounded-full shadow-md mt-1"
          draggable={false}
        />

        {/* ชื่อผู้ใช้ / Loading / Error */}
        <div className="text-center mt-2 mb-1 min-h-[28px] h-7 flex items-center justify-center">
          {loading ? (
            <span className="text-sm text-gray-400 animate-pulse">กำลังโหลดข้อมูล...</span>
          ) : fetchError ? (
            <span className="text-sm text-red-500">{fetchError}</span>
          ) : (
            <span className="text-base font-medium" style={{ color: COLORS.blue }}>
              {user.user_first_name} {user.user_last_name}
            </span>
          )}
        </div>

        <h1 className="text-lg font-bold text-center mb-2 tracking-wide" style={{ color: COLORS.dark }}>
          เมนูแบบสอบถามร้านค้า
        </h1>

        {/* ปุ่มต่าง ๆ */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href={{
              pathname: "/survey/permission",
              query: { result: "อนุญาต", user_id }
            }}
            className={`
              w-full py-3 rounded-2xl
              text-base font-semibold text-white text-center
              shadow-md hover:scale-[1.03] active:scale-100
              transition-all duration-150
              ${!user_id ? "pointer-events-none opacity-50" : ""}
            `}
            style={{
              backgroundColor: COLORS.blue,
              border: `2px solid ${COLORS.blue}`,
              letterSpacing: "0.5px",
            }}
            aria-disabled={!user_id}
            tabIndex={!user_id ? -1 : 0}
          >
            อนุญาต
          </Link>
          <Link
            href={{
              pathname: "/survey/permission_no",
              query: { result: "ไม่อนุญาต", user_id }
            }}
            className={`
              w-full py-3 rounded-2xl
              text-base font-semibold text-white text-center
              shadow-md hover:scale-[1.03] active:scale-100
              transition-all duration-150
              ${!user_id ? "pointer-events-none opacity-50" : ""}
            `}
            style={{
              backgroundColor: COLORS.orange,
              border: `2px solid ${COLORS.orange}`,
              letterSpacing: "0.5px",
            }}
            aria-disabled={!user_id}
            tabIndex={!user_id ? -1 : 0}
          >
            ไม่อนุญาต
          </Link>
          <Link
            href={{
              pathname: "/survey/dashboard_emp",
              query: { user_id }
            }}
            className={`
              w-full py-3 rounded-2xl
              text-base font-semibold text-gray-700 text-center
              shadow-md hover:scale-[1.03] hover:bg-gray-300 transition-all
              ${!user_id ? "pointer-events-none opacity-50" : ""}
            `}
            style={{
              backgroundColor: COLORS.gray,
              color: COLORS.dark,
              border: `2px solid ${COLORS.gray}`,
              letterSpacing: "0.5px",
            }}
            aria-disabled={!user_id}
            tabIndex={!user_id ? -1 : 0}
          >
            สรุปงาน
          </Link>
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="w-full mt-3">
          <Link
            href="/"
            className={`
              w-full flex items-center justify-center gap-2
              py-3 rounded-2xl
              text-base font-semibold text-white text-center
              shadow-md bg-[#D32F2F] hover:scale-[1.03]
              hover:bg-[#ba2424] active:scale-[0.98]
              focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus:outline-none
              transition-all duration-150
            `}
            style={{
              border: `2px solid ${COLORS.logout}`,
              letterSpacing: "0.5px",
            }}
          >
            <LogOut size={20} />
            ออกจากระบบ
          </Link>
        </div>

        {/* กรณีไม่มี user_id */}
        {!user_id && (
          <div className="text-center text-red-500 text-xs mt-3">
            <b>ไม่พบ user_id ใน url</b><br />
            กรุณาเข้าผ่านลิงก์ที่ถูกต้อง หรือ ติดต่อแอดมิน
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyMenu;
