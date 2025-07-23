"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useSearchParams } from "next/navigation";

const foremostBlue = "#0094E5";
const foremostOrange = "#FF9100";
const darkText = "#222";
const logoutRed = "#D32F2F";

export default function SurveyMenuClient() {  // <-- export default ต้องชื่อเดียวกับไฟล์
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");

  const [user, setUser] = useState({ user_first_name: "DEMO", user_last_name: "DEMO" });

  useEffect(() => {
    if (!user_id) return;
    const fetchUser = async () => {
      const res = await fetch(`/api/survey/get/user?user_id=${user_id}`); // แก้ servey -> survey
      const data = await res.json();
      setUser(data[0] || {});
    };
    fetchUser();
  }, [user_id]);

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

        {/* ชื่อผู้ใช้ */}
        <div className="text-center mt-2 mb-1 min-h-[28px]">
          <span className="text-base font-medium" style={{ color: foremostBlue }}>
            {user.user_first_name} {user.user_last_name}
          </span>
        </div>

        {/* หัวข้อ */}
        <h1 className="text-lg font-bold text-center mb-2 tracking-wide" style={{ color: darkText }}>
          เมนูแบบสอบถามร้านค้า
        </h1>

        {/* ปุ่มต่าง ๆ */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href={{
              pathname: "/survey/permission",
              query: { result: "อนุญาต", user_id }
            }}
            className="w-full py-3 rounded-2xl text-base font-semibold text-white text-center shadow-md hover:scale-[1.03] active:scale-100 transition-all duration-150"
            style={{
              backgroundColor: foremostBlue,
              border: `2px solid ${foremostBlue}`,
              letterSpacing: "0.5px",
            }}
          >
            อนุญาต
          </Link>
          <Link
            href={{
              pathname: "/survey/permission_no",
              query: { result: "ไม่อนุญาต", user_id }
            }}
            className="w-full py-3 rounded-2xl text-base font-semibold text-white text-center shadow-md hover:scale-[1.03] active:scale-100 transition-all duration-150"
            style={{
              backgroundColor: foremostOrange,
              border: `2px solid ${foremostOrange}`,
              letterSpacing: "0.5px",
            }}
          >
            ไม่อนุญาต
          </Link>
          <Link
            href={{
              pathname: "/survey/dashboard_emp",
              query: { user_id }
            }}
            className="w-full py-3 rounded-2xl text-base font-semibold text-gray-700 text-center shadow-md hover:scale-[1.03] hover:bg-gray-300 transition-all"
            style={{
              backgroundColor: "#ececec",
              color: darkText,
              border: "2px solid #ececec",
              letterSpacing: "0.5px",
            }}
          >
            สรุปงาน
          </Link>
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="w-full mt-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-semibold text-white text-center shadow-md bg-[#D32F2F] hover:scale-[1.03] hover:bg-[#ba2424] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D32F2F] focus:outline-none transition-all duration-150"
            style={{
              border: `2px solid ${logoutRed}`,
              letterSpacing: "0.5px",
            }}
          >
            <LogOut size={20} />
            ออกจากระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
