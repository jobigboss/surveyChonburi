"use client";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [productList, setProductList] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);

  const router = useRouter();

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    setLoading(true);

    const queryParams = new URLSearchParams({});
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (selectedUser) queryParams.append("user_id", selectedUser);
    if (province) queryParams.append("province", province);
    if (district) queryParams.append("district", district);

    fetch(`/api/servey/report/get-report?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports(data.reports);
          setTotal(data.reports.length); // จำนวนวัน
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [startDate, endDate, selectedUser, province, district]);

  useEffect(() => {
    setFetchError("");
    fetch("/api/servey/get/product")
      .then((res) => {
        if (!res.ok) throw new Error("โหลดข้อมูลสินค้าไม่สำเร็จ");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProductList(data.products);
        } else if (Array.isArray(data)) {
          setProductList(data);
        } else {
          setProductList([]);
        }
      })
      .catch(() => {
        setFetchError("เกิดข้อผิดพลาดในการโหลดสินค้า");
        setProductList([]);
      });
  }, []);

  const uniqueUsers = [...new Set(reports.map((r) => r.user_id).filter(Boolean))];

  const groupedByDate = reports.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString("th-TH");
    if (!acc[date]) acc[date] = [];
    acc[date].push(report);
    return acc;
  }, {});

  const dailyStats = Object.entries(groupedByDate)
    .map(([date, items]) => {
      const approved = items.filter((r) => r.store_info?.permission === "อนุญาต").length;
      const notApproved = items.filter((r) => r.store_info?.permission === "ไม่อนุญาต").length;
      return { date, total: items.length, approved, notApproved, items };
    })
    .sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));

  const paginatedStats = dailyStats.slice((page - 1) * limit, page * limit);

  const avgTotal = (reports.length / dailyStats.length) || 0;
  const avgApproved = (reports.filter((r) => r.store_info?.permission === "อนุญาต").length / reports.length) || 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6">

        {/* Header + กลับเมนูหลัก */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800">รายงาน Survey</h1>

        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
          <div>
            <label className="block text-sm mb-1">วันที่เริ่ม</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">วันที่สิ้นสุด</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">ผู้คีย์</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="border rounded-lg p-2 w-full">
              <option value="">-- ทั้งหมด --</option>
              {uniqueUsers.map((u, idx) => (
                <option key={idx} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">จังหวัด</label>
            <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="border rounded-lg p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">อำเภอ</label>
            <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="border rounded-lg p-2 w-full" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedUser("");
                setProvince("");
                setDistrict("");
                setPage(1);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg w-full"
            >ล้างตัวกรอง</button>
          </div>
        </div>

        {/* Summary Table */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin mr-2" size={24} /> กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 font-semibold text-sm">
              ค่าเฉลี่ยร้านที่สำรวจ: {avgTotal.toFixed(2)} | อนุญาต: {avgApproved.toFixed(2)}
            </div>
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">วันที่</th>
                  <th className="p-2 border">จำนวนร้าน</th>
                  <th className="p-2 border">อนุญาต</th>
                  <th className="p-2 border">ไม่อนุญาต</th>
                  <th className="p-2 border">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStats.map((d) => (
                  <tr key={d.date} className="hover:bg-gray-50">
                    <td className="p-2 border">{d.date}</td>
                    <td className="p-2 border">{d.total}</td>
                    <td className="p-2 border">{d.approved}</td>
                    <td className="p-2 border">{d.notApproved}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => setSelectedDate(d)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >ดูรายละเอียด</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border p-2 rounded-lg"
              >
                {[25, 50, 75, 100].map((n) => (
                  <option key={n} value={n}>{n} รายการ / หน้า</option>
                ))}
              </select>
              <div className="space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >◀</button>
                <span>หน้า {page} / {Math.ceil(dailyStats.length / limit)}</span>
                <button
                  disabled={page * limit >= dailyStats.length}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >▶</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">ร้านที่บันทึกวันที่ {selectedDate.date}</h2>
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ลำดับ</th>
                  <th className="border p-2">ชื่อร้าน</th>
                  <th className="border p-2">ขออนุญาตสำรวจร้าน</th>
                  <th className="border p-2">ลักษณะร้าน</th>
                  <th className="border p-2">ประเภทร้าน</th>
                  <th className="border p-2">ที่มาของสินค้า</th>
                  <th className="border p-2">สาเหตุที่ไม่อนุญาต</th>
                </tr>
              </thead>
              <tbody>
                {selectedDate.items.map((r, i) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{r.store_info?.store_name || "-"}</td>
                    <td className="border p-2">{r.store_info?.permission || "-"}</td>
                    <td className="border p-2">{r.store_info?.shop_size || "-"}</td>
                    <td className="border p-2">{r.store_info?.special_type || "-"}</td>
                    <td className="border p-2">{r.store_info?.reason || "-"}</td>
                    <td className="border p-2">{r.store_info?.permission_reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedDate(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
