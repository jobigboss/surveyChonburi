"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ เพิ่ม
import Register from "./components/registerPage";
import EditUser from "./components/editUser";
import { UserPlus, Pencil, ArrowLeft } from "lucide-react";

const foremostBlue = "#0094E5";
const foremostYellow = "#F1C40F";
const darkText = "#222";

export default function ManageUserPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter(); // ✅ ใช้ router สำหรับ navigate

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa] px-4">
      <div className="w-full max-w-[480px] bg-white shadow-2xl rounded-[32px] p-8 flex flex-col items-center gap-6">
        {/* หัวข้อ */}
        <h1 className="text-lg font-bold text-center tracking-wide" style={{ color: darkText }}>
          จัดการผู้ใช้
        </h1>

        {/* ปุ่มเมนู */}
        <div className="flex flex-col gap-3 w-full">
          

          {/* เพิ่มผู้ใช้ */}
          <button
            onClick={() => setShowRegister(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-semibold text-white shadow-md hover:scale-[1.03] active:scale-100 transition-all duration-150"
            style={{
              backgroundColor: foremostBlue,
              border: `2px solid ${foremostBlue}`,
              letterSpacing: "0.5px",
            }}
          >
            <UserPlus size={22} />
            เพิ่มผู้ใช้
          </button>

          {/* แก้ไขผู้ใช้ */}
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-semibold text-white shadow-md hover:scale-[1.03] active:scale-100 transition-all duration-150"
            style={{
              backgroundColor: foremostYellow,
              border: `2px solid ${foremostYellow}`,
              letterSpacing: "0.5px",
            }}
          >
            <Pencil size={22} />
            แก้ไขผู้ใช้
          </button>
          
          {/* ปุ่มกลับหน้าหลัก */}
          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-semibold text-white shadow-md hover:scale-[1.03] active:scale-100 transition-all duration-150"
            style={{
              backgroundColor: "#6c757d", // สีเทา
              border: "2px solid #6c757d",
              letterSpacing: "0.5px",
            }}
          >
            {/* <ArrowLeft size={22} /> */}
            กลับหน้าหลัก
          </button>
        </div>

        {/* ✅ Modal เพิ่มผู้ใช้ */}
        {showRegister && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4 text-center">เพิ่มผู้ใช้</h2>
              <Register onClose={() => setShowRegister(false)} />
            </div>
          </div>
        )}

        {/* ✅ Modal แก้ไขผู้ใช้ */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4 text-center">แก้ไขผู้ใช้</h2>
              <EditUser onClose={() => setShowEdit(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
