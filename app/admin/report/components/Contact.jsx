import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { ShoppingBag, MapPin, XCircle, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- PRODUCT COLUMNS (สินค้าที่ต้องแยก column) ---
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

// --- Utils ---
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
          <div className="text-gray-400 py-10 text-center">ไม่มีรายการใบสั่งซื้อ</div>
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

// --- Skeleton Loader สำหรับ Table
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

// --- Export Excel (all data)
async function handleExportAll({ search, startDate, endDate }) {
  // ดึงข้อมูลทุกหน้า (ไม่จำกัด page)
  const url = `/api/servey/report/contact?all=1`
    + `&search=${encodeURIComponent(search)}`
    + `&startDate=${encodeURIComponent(startDate)}`
    + `&endDate=${encodeURIComponent(endDate)}`;
  const res = await fetch(url);
  const json = await res.json();
  exportRowsToExcel(json.data || []);
}

function exportRowsToExcel(rows) {
  if (!rows || !rows.length) return;

  const excelRows = rows.map(row => {
    // Map ชื่อสินค้า → qty
    const prodMap = {};
    (row.interest_products || []).forEach(p => {
      prodMap[p.name] = (p.qty ?? 0);
    });

    // Gen row object (หัวหลัก)
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
    // Loop ใส่สินค้า 10 ช่อง
    PRODUCT_COLS.forEach(name => {
      obj[name] = prodMap[name] ?? 0;
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `report_${Date.now()}.xlsx`);
}

// --- Table Row
function ContactTableRow({ data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const mapUrl = `https://maps.google.com/?q=${data.lat},${data.lng}`;
  const orderCount = (data.interest_products || []).filter(p => (p.qty ?? 0) > 0).length;

  return (
    <tr className="group hover:bg-blue-50 border-b last:border-none transition">
      <td className="p-2 text-gray-500 whitespace-nowrap">{formatDate(data.createdAt)}</td>
      <td className="p-2 text-gray-900 font-semibold whitespace-nowrap">{data.store_name}</td>
      <td className="p-2 text-blue-800 whitespace-nowrap">{data.contact}</td>
      <td className="p-2 text-emerald-700 whitespace-nowrap" style={{minWidth: '120px'}}>{data.phone}</td>
      <td className="p-2 text-blue-800 whitespace-nowrap" style={{minWidth: '100px'}}>
        {data.lat ? cutDecimal(data.lat, 6) : "-"}
      </td>
      <td className="p-2 text-blue-800 whitespace-nowrap" style={{minWidth: '100px'}}>
        {data.lng ? cutDecimal(data.lng, 6) : "-"}
      </td>
      <td className="p-2" style={{minWidth:'90px'}}>
        <button
          className="flex items-center gap-1 border-2 border-emerald-400 rounded-full px-2 py-0.5 bg-white hover:bg-emerald-50 transition"
          onClick={() => setModalOpen(true)}
        >
          <ShoppingBag size={18} className="text-emerald-600" />
          <span className="sr-only">ใบสั่งซื้อ</span>
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
      <td className="p-2" style={{minWidth:'70px'}}>
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

// --- Main Table
export default function ContactTable() {
  const today = new Date().toISOString().slice(0,10); // yyyy-mm-dd
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(null);   // ให้เป็น string key
  const limit = 20;

  const validEndDate = endDate >= startDate && endDate <= today;
  const validStartDate = startDate <= today;

  // stable query string key (string)
  const stableKey = useMemo(() => {
    if (!query) return null;
    return `/api/servey/report/contact?page=${page}&limit=${limit}&search=${encodeURIComponent(query.search)}&startDate=${encodeURIComponent(query.startDate)}&endDate=${encodeURIComponent(query.endDate)}`;
    // eslint-disable-next-line
  }, [query, page]);

  const { data, error, isLoading } = useSWR(
    stableKey,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const rows = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPage: 1, total: 0 };

  // โหลดข้อมูลทั้งหมดทันทีเมื่อเปิดหน้าครั้งแรก (เรียงล่าสุดก่อน)
  useEffect(() => {
    setQuery({ search: "", startDate: sevenDaysAgo, endDate: today });
    setPage(1);
    // eslint-disable-next-line
  }, []);

  function handleSearch() {
    if (!validEndDate || !validStartDate) return;
    setQuery({
      search,
      startDate,
      endDate,
    });
    setPage(1);
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
              style={{minWidth:120}}
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
              style={{minWidth:120}}
            />
          </div>
          <button
            className="flex gap-1 items-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow"
            onClick={handleSearch}
            disabled={!validEndDate || !validStartDate}
          >
            <Search size={18} /> ค้นหา
          </button>
          {!validEndDate && (
            <span className="text-red-600 text-xs font-medium ml-2">
              วันที่สิ้นสุดต้องไม่เร็วกว่าวันที่เริ่มต้น และไม่เกินวันนี้
            </span>
          )}
          <span className="text-sm text-gray-500 ml-2">{pagination.total} ร้านค้า</span>
        </div>
        {/* Export Button */}
        <button
          type="button"
          className="flex gap-1 items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow"
          onClick={() => handleExportAll({ search, startDate, endDate })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Export Excel
        </button>
      </div>
      <div className="overflow-x-auto bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-2xl border border-blue-100">
        <table className="min-w-[1200px] w-full text-sm border-separate border-spacing-0 rounded-3xl overflow-hidden">
          <caption className="text-left px-4 py-2 text-blue-600 font-medium caption-top bg-white rounded-t-3xl mb-1 shadow-sm">
            รายงานร้านค้าทั้งหมด (คลิก “ใบสั่งซื้อ” หรือ “เดินทาง”)
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
            {isLoading && <TableSkeleton rows={limit} />}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400 bg-white">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((row, i) => (
                <ContactTableRow data={row} key={i} />
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-6 items-center justify-center">
        <button
          className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-blue-100 font-bold shadow disabled:opacity-40"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1 || !stableKey}
        >
          ⬅️ ก่อนหน้า
        </button>
        <span className="font-medium text-gray-700">
          หน้า <span className="text-blue-600">{pagination.page}</span> / {pagination.totalPage}
        </span>
        <button
          className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-blue-100 font-bold shadow disabled:opacity-40"
          onClick={() => setPage(p => Math.min(pagination.totalPage, p + 1))}
          disabled={page >= pagination.totalPage || !stableKey}
        >
          ถัดไป ➡️
        </button>
      </div>
    </div>
  );
}
