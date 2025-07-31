import React, { useState, useEffect } from "react";
import { ShoppingBag, MapPin, XCircle, Search } from "lucide-react";
import useSWR from "swr";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- PRODUCT COLUMNS ---
const PRODUCT_COLS = [
  "Omega Gold 1+ รสจืด 180ml",
  "Omega Gold 4+ รสจืด 180ml",
  "Omega รสจืด 110ml",
  "Omega รสจืด 180ml",
  "Omega รสหวาน 180ml",
  "Omega รสช็อกโกแลต 180ml",
  "Foremost รสจืด 225ml",
  "Foremost รสช็อกโกแลต 225ml",
  "Foremost รสช็อกโกแลต 165ml",
  "Foremost ช็อกโกแลตผสมธัญพืชรวม 180ml",
];

function cutDecimal(val, digits = 6) {
  if (typeof val !== "string") val = String(val ?? "");
  const [intPart, decimal = ""] = val.split(".");
  if (decimal.length > 0) {
    return intPart + "." + decimal.substring(0, digits);
  }
  return intPart;
}
function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date)) return "-";
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" });
}
const fetcher = url => fetch(url).then(res => res.json());

// --- Modal
function OrderModal({ open, onClose, products }) {
  const filtered = (products || []).filter(p => (p.qty ?? 0) > 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[340px] max-w-[95vw] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <XCircle size={26} />
        </button>
        <div className="flex items-center gap-2 mb-4 text-lg font-bold text-emerald-700">
          <ShoppingBag size={22} /> สินค้าที่สนใจ
        </div>
        {filtered.length === 0 ? (
          <div className="text-gray-400 py-10 text-center">ไม่มีรายการ</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-base text-gray-800 border-b">
                <th className="py-1 px-2 text-left font-semibold">สินค้า</th>
                <th className="py-1 px-2 text-right font-semibold">จำนวน (แพ็ค)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b last:border-none">
                  <td className="py-1 px-2">{p.name}</td>
                  <td className="py-1 px-2 text-right">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          className="mt-5 w-full py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold shadow"
          onClick={onClose}
        >
          ปิด
        </button>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 10 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="animate-pulse bg-white">
          {Array.from({ length: 10 }).map((__, i) => (
            <td key={i} className="py-3 px-2">
              <div className="h-4 bg-gray-200 rounded"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function ContactTableRow({ data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const mapUrl = `https://maps.google.com/?q=${data.lat},${data.lng}`;
  const orderCount = (data.interest_products || []).filter(p => (p.qty ?? 0) > 0).length;

  return (
    <tr className="group hover:bg-blue-50 border-b last:border-none transition">
      <td className="p-2 text-gray-500 whitespace-nowrap">{formatDate(data.createdAt)}</td>
      <td className="p-2 text-gray-900 font-semibold whitespace-nowrap">{data.store_name}</td>
      <td className="p-2 text-blue-800 whitespace-nowrap">{data.contact}</td>
      <td className="p-2 text-emerald-700 whitespace-nowrap" style={{ minWidth: '120px' }}>{data.phone}</td>
      <td className="p-2 text-blue-800 whitespace-nowrap" style={{ minWidth: '100px' }}>
        {data.lat ? cutDecimal(data.lat, 6) : "-"}
      </td>
      <td className="p-2 text-blue-800 whitespace-nowrap" style={{ minWidth: '100px' }}>
        {data.lng ? cutDecimal(data.lng, 6) : "-"}
      </td>
      <td className="p-2" style={{ minWidth: '90px' }}>
        <button
          className="flex items-center gap-1 border-2 border-emerald-400 rounded-full px-2 py-0.5 bg-white hover:bg-emerald-50 transition"
          onClick={() => setModalOpen(true)}
        >
          <ShoppingBag size={18} className="text-emerald-600" />
          <span className="sr-only">สินค้าที่สนใจ</span>
          <span className="flex items-center bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-2 ml-1 rounded-full text-base min-w-[30px] justify-center">
            {orderCount}
          </span>
        </button>
        <OrderModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          products={data.interest_products}
        />
      </td>
      <td className="p-2" style={{ minWidth: '70px' }}>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 border border-blue-400 hover:bg-blue-500 hover:text-white text-blue-600 px-2 py-1 rounded-lg shadow-sm font-semibold transition-all duration-150"
        >
          <MapPin size={18} className="inline-block" />
          <span className="hidden md:inline">ไป</span>
        </a>
      </td>
      <td className="p-2 text-gray-700 whitespace-nowrap">{data.address}</td>
      <td className="p-2 font-mono text-blue-900 whitespace-nowrap">{data.surID}</td>
    </tr>
  );
}

// --------- MAIN COMPONENT ---------
export default function ContactTable() {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [search, setSearch] = useState("");
  const [activeProvince, setActiveProvince] = useState(""); // จังหวัดปัจจุบัน

  // Fetch data ทุกจังหวัด (all=1)
  const url =
    `/api/servey/report/contact?all=1`
    + `&search=${encodeURIComponent(search)}`
    + `&startDate=${encodeURIComponent(startDate)}`
    + `&endDate=${encodeURIComponent(endDate)}`;

  const { data, isLoading } = useSWR(url, fetcher);

  // Group by จังหวัด
  const groupedByProvince = React.useMemo(() => {
    const group = {};
    (data?.data || []).forEach(row => {
      const pv = row?.address?.split(" ")?.slice(-2, -1)?.[0] || "-"; // หรือใช้ row.province ถ้ามี field นี้
      if (!group[pv]) group[pv] = [];
      group[pv].push(row);
    });
    return group;
  }, [data]);

  // รายชื่อจังหวัดในข้อมูล
  const provinces = Object.keys(groupedByProvince);

  // activeProvince default: จังหวัดแรก
  useEffect(() => {
    if (provinces.length && !activeProvince) setActiveProvince(provinces[0]);
  }, [provinces, activeProvince]);

  function handleExportAll() {
    // แยก sheet ตามจังหวัด
    if (!data?.data?.length) return;

    const wb = XLSX.utils.book_new();
    provinces.forEach(pv => {
      const rows = groupedByProvince[pv];
      const excelRows = rows.map(row => {
        const prodMap = {};
        (row.interest_products || []).forEach(p => {
          prodMap[p.name] = (p.qty ?? 0);
        });
        const obj = {
          "วันที่สร้าง": formatDate(row.createdAt),
          "ชื่อร้านค้า": row.store_name,
          "ผู้ติดต่อ": row.contact,
          "เบอร์โทร": row.phone,
          "Latitude": row.lat ? cutDecimal(row.lat, 6) : "",
          "Longitude": row.lng ? cutDecimal(row.lng, 6) : "",
          "ที่อยู่": row.address,
          "ID": row.surID,
        };
        PRODUCT_COLS.forEach(name => {
          obj[name] = prodMap[name] ?? 0;
        });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(excelRows);
      XLSX.utils.book_append_sheet(wb, ws, pv || "จังหวัดไม่ระบุ");
    });
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `report_by_province_${Date.now()}.xlsx`);
  }

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <div className="mb-3 flex flex-wrap gap-2 items-end justify-between">
        {/* Filter/Search Area */}
        <div className="flex flex-wrap gap-2 items-end">
          <input
            className="border border-blue-200 focus:ring-2 focus:ring-blue-300 outline-none rounded-lg px-3 py-2 text-base shadow"
            placeholder="🔍 ค้นหาชื่อร้านค้า..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">วันที่เริ่ม</span>
            <input
              type="date"
              max={today}
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) setEndDate(e.target.value);
              }}
              className="border border-gray-200 rounded px-2 py-1"
              style={{ minWidth: 120 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">ถึง</span>
            <input
              type="date"
              min={startDate}
              max={today}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1"
              style={{ minWidth: 120 }}
            />
          </div>
          <button
            className="flex gap-1 items-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow"
            onClick={() => {}} // รีเฟรช swr อยู่แล้ว ไม่ต้อง handle
          >
            <Search size={18} /> ค้นหา
          </button>
          <span className="text-sm text-gray-500 ml-2">{data?.pagination?.total ?? 0} ร้านค้า</span>
        </div>
        <button
          type="button"
          className="flex gap-1 items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow"
          onClick={handleExportAll}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Export Excel
        </button>
      </div>

      {/* --- Province Tabs --- */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {provinces.map(pv => (
          <button
            key={pv}
            className={`px-4 py-2 rounded-t-xl font-bold border-b-2 ${
              pv === activeProvince
                ? "bg-white border-blue-600 text-blue-700 shadow"
                : "bg-blue-50 border-transparent text-blue-400"
            }`}
            onClick={() => setActiveProvince(pv)}
          >
            {pv}
          </button>
        ))}
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-2xl border border-blue-100">
        <table className="min-w-[1200px] w-full text-sm border-separate border-spacing-0 rounded-3xl overflow-hidden">
          <caption className="text-left px-4 py-2 text-blue-600 font-medium caption-top bg-white rounded-t-3xl mb-1 shadow-sm">
            รายงานร้านค้าทั้งหมด
          </caption>
          <thead>
            <tr className="bg-blue-200 text-blue-900 text-base font-bold shadow-sm">
              <th className="p-2">วันที่สร้าง</th>
              <th className="p-2">ชื่อร้านค้า</th>
              <th className="p-2">ผู้ติดต่อ</th>
              <th className="p-2">เบอร์โทร</th>
              <th className="p-2">Latitude</th>
              <th className="p-2">Longitude</th>
              <th className="p-2">สินค้าที่สนใจ</th>
              <th className="p-2">พิกัด</th>
              <th className="p-2">ที่อยู่</th>
              <th className="p-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeleton rows={15} />}
            {!isLoading && groupedByProvince[activeProvince]?.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400 bg-white">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
            {!isLoading &&
              groupedByProvince[activeProvince]?.map((row, i) => (
                <ContactTableRow data={row} key={i} />
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
