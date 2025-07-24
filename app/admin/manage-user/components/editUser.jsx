"use client";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function EditUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [routes, setRoutes] = useState([]);

  // เก็บ user ที่เลือกแก้ไข
  const [selectedUser, setSelectedUser] = useState(null);

  // โหลดรายชื่อผู้ใช้
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/servey/editUser/get-user");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // โหลด route เมื่อเปิดฟอร์มแก้ไข
  useEffect(() => {
    if (selectedUser?.role === "member") {
      fetch("/api/servey/get/routes")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRoutes(data.routes);
        })
        .catch((err) => console.error(err));
    }
  }, [selectedUser?.role]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ลบผู้ใช้
  // const handleDelete = async (id) => {
  //   if (!confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) return;
  //   try {
  //     const res = await fetch(`/api/servey/user/delete?id=${id}`, {
  //       method: "DELETE",
  //     });
  //     const result = await res.json();
  //     if (result.success) {
  //       alert("✅ ลบผู้ใช้สำเร็จ");
  //       fetchUsers();
  //     } else {
  //       alert("❌ ลบไม่สำเร็จ");
  //     }
  //   } catch (error) {
  //     console.error("Delete error:", error);
  //     alert("เกิดข้อผิดพลาด");
  //   }
  // };

  // แก้ไขผู้ใช้
  const handleUpdate = async () => {
    if (!selectedUser) return;

    const { user_id, user_first_name, user_last_name, role, route } = selectedUser;

    if (!user_id || !user_first_name || !user_last_name) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (role === "member" && !route) {
      alert("กรุณาเลือกโซนสำหรับ Member");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/servey/editUser/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.message);
      } else {
        alert("✅ อัปเดตข้อมูลสำเร็จ");
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={onClose}
        className="mb-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        {/* <ArrowLeft size={18} className="inline mr-2" /> */}
        ปิด
      </button>

      {/* ตารางผู้ใช้ */}
      <div className="overflow-x-auto mb-6">
        {loading ? (
          <p className="text-center">กำลังโหลด...</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border">Username</th>
                <th className="p-2 border">ชื่อ-นามสกุล</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Route</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{u.user_id}</td>
                    <td className="p-2 border">
                      {u.user_first_name} {u.user_last_name}
                    </td>
                    <td className="p-2 border">{u.role}</td>
                    <td className="p-2 border">{u.route || "-"}</td>
                    <td className="p-2 border flex gap-2 justify-center">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <Pencil size={16} /> แก้ไข
                      </button>
                      {/* <button
                        onClick={() => handleDelete(u._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        <Trash2 size={16} />
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-3 text-gray-500">
                    ไม่มีข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ฟอร์มแก้ไข */}
      {selectedUser && (
        <div className="p-4 border rounded-xl shadow-lg bg-gray-50">
          <h3 className="text-lg font-bold mb-3">แก้ไขผู้ใช้</h3>
          <input
            type="text"
            name="user_id"
            placeholder="Username"
            className="w-full border rounded-lg p-2 mb-2"
            value={selectedUser.user_id}
            disabled
          />
          <input
            type="text"
            name="user_first_name"
            placeholder="ชื่อ"
            className="w-full border rounded-lg p-2 mb-2"
            value={selectedUser.user_first_name}
            onChange={(e) => setSelectedUser({ ...selectedUser, user_first_name: e.target.value })}
          />
          <input
            type="text"
            name="user_last_name"
            placeholder="นามสกุล"
            className="w-full border rounded-lg p-2 mb-2"
            value={selectedUser.user_last_name}
            onChange={(e) => setSelectedUser({ ...selectedUser, user_last_name: e.target.value })}
          />
          <input
            type="text"
            name="user_tel"
            placeholder="เบอร์โทร"
            className="w-full border rounded-lg p-2 mb-2"
            value={selectedUser.user_tel}
            onChange={(e) => setSelectedUser({ ...selectedUser, user_tel: e.target.value })}
          />
          <select
            className="w-full border rounded-lg p-2 mb-2"
            value={selectedUser.role}
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {selectedUser.role === "member" && (
            <select
              className="w-full border rounded-lg p-2 mb-2"
              value={selectedUser.route || ""}
              onChange={(e) => setSelectedUser({ ...selectedUser, route: e.target.value })}
            >
              <option value="">-- เลือก Route --</option>
              {routes.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleUpdate}
            className={`w-full text-white py-2 rounded-lg ${
              isUpdating ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            disabled={isUpdating}
          >
            {isUpdating ? "กำลังอัปเดต..." : "อัปเดตข้อมูล"}
          </button>
        </div>
      )}
    </div>
  );
}
