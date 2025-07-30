"use client";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const router = useRouter();
  const [productList, setProductList] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);

  // ✅ Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // ✅ โหลดข้อมูลรายงาน
  useEffect(() => {
    setLoading(true);
    fetch(`/api/servey/report/get-report?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports(data.reports);
          setFilteredReports(data.reports);
          setTotal(data.total);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, limit]);

  // ✅ โหลดข้อมูลสินค้า
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

  // ✅ ฟังก์ชันหา product
  const findProduct = (id) => {
    if (!id) return null;
    return (
      productList.find((p) => p.fmProID?.toUpperCase() === id.toUpperCase()) ||
      null
    );
  };

  // ✅ กรองรายงานตาม Filter
  useEffect(() => {
    let filtered = [...reports];

    // กรองตามผู้คีย์
    if (selectedUser) {
      filtered = filtered.filter((r) => r.user_id === selectedUser);
    }

    // กรองตามวันที่
    if (startDate || endDate) {
      filtered = filtered.filter((r) => {
        const reportDate = new Date(r.createdAt);
        const sDate = startDate ? new Date(startDate) : null;
        const eDate = endDate ? new Date(endDate) : null;

        if (sDate && reportDate < sDate) return false;
        if (eDate) {
          eDate.setHours(23, 59, 59); // รวมทั้งวัน
          if (reportDate > eDate) return false;
        }
        return true;
      });
    }

    setFilteredReports(filtered);
  }, [startDate, endDate, selectedUser, reports]);

  // ✅ ดึงชื่อผู้คีย์ไม่ซ้ำ
  const uniqueUsers = [...new Set(reports.map((r) => r.user_id).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">รายงาน Survey</h1>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={18} className="mr-2" /> กลับหน้าหลัก
          </button>
        </div>

        <div className="flex justify-between items-center mb-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // reset ไปหน้าแรก
            }}
            className="border p-2 rounded-lg"
          >
            {[25, 50, 75, 100].map((n) => (
              <option key={n} value={n}>
                {n} รายการ / หน้า
              </option>
            ))}
          </select>

          <div className="space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ◀
            </button>
            <span>หน้า {page} / {Math.ceil(total / limit)}</span>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ✅ Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
          <div>
            <label className="block text-sm mb-1">วันที่เริ่ม</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">ผู้คีย์</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border rounded-lg p-2 w-full"
            >
              <option value="">-- ทั้งหมด --</option>
              {uniqueUsers.map((u, idx) => (
                <option key={idx} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedUser("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg w-full"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* ✅ Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin mr-2" size={24} />
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3 border">ลำดับ</th>
                  <th className="p-3 border">ชื่อร้าน</th>
                  <th className="p-3 border">สินค้าในระบบ</th>
                  <th className="p-3 border">ความต้องการซื้อ</th>
                  <th className="p-3 border">ผู้คีย์</th>
                  <th className="p-3 border">วันที่บันทึก</th>
                  <th className="p-3 border text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((r, i) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="p-3 border">{i + 1}</td>
                      <td className="p-3 border">
                        {r.store_info?.store_name || "-"}
                      </td>
                      <td className="p-3 border">{r.products?.length || 0}</td>
                      <td className="p-3 border">
                        {r.market_info?.demand || "-"}
                      </td>
                      <td className="p-3 border">{r.user_id || "-"}</td>
                      <td className="p-3 border">
                        {new Date(r.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Eye size={16} /> ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      ไม่มีข้อมูลรายงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Modal เดิม (แสดงรายละเอียด + ตารางสินค้า) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">รายละเอียด Survey</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ชื่อร้าน:</strong>{" "}
                {selectedReport.store_info?.store_name || "-"}
              </p>
              <p>
                <strong>ที่อยู่:</strong>{" "}
                {selectedReport.store_info?.location_address || "-"}
              </p>
              <p>
                <strong>ผู้คีย์:</strong> {selectedReport.user_id || "-"}
              </p>
              <p>
                <strong>ความต้องการซื้อ:</strong>{" "}
                {selectedReport.market_info?.demand || "-"}
              </p>
              <p>
                <strong>ที่มาของสินค้า:</strong>{" "}
                {selectedReport.market_info?.reason || "-"}
              </p>

              {/* ตารางสินค้า */}
              <h3 className="font-semibold mt-4">
                สินค้าในระบบ ({selectedReport.products?.length || 0})
              </h3>
              <div className="overflow-x-auto mt-2">
                <table className="w-full border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border p-2">#</th>
                      <th className="border p-2">รหัสสินค้า</th>
                      <th className="border p-2">ชื่อสินค้า</th>
                      <th className="border p-2">ขนาด</th>
                      <th className="border p-2">สถานะ</th>
                      <th className="border p-2">ราคาแพ็ค</th>
                      <th className="border p-2">ราคากล่อง</th>
                      <th className="border p-2">ราคาลัง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.products && selectedReport.products.length > 0 ? (
                      selectedReport.products.map((p, index) => {
                        const product = findProduct(p.product_id);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-2 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-2">{p.product_id || "-"}</td>
                            <td className="border p-2">
                              {product ? product.fmProName : "-"}
                            </td>
                            <td className="border p-2">
                              {product ? product.fmProSize : "-"}
                            </td>
                            <td className="border p-2">{p.status || "-"}</td>
                            <td className="border p-2">
                              {p.pricePack ?? "-"}
                            </td>
                            <td className="border p-2">
                              {p.priceBox ?? "-"}
                            </td>
                            <td className="border p-2">
                              {p.priceCarton ?? "-"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center p-3">
                          ไม่มีข้อมูลสินค้า
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
