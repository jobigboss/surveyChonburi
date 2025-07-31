import React, { useState } from "react";
import useSWR from "swr";

const fetcher = url => fetch(url).then(res => res.json());

function ContactTableRow({ data }) {
  const mapUrl = `https://maps.google.com/?q=${data.lat},${data.lng}`;
  return (
    <tr className="group hover:bg-blue-50 transition border-b last:border-none">
      <td className="p-3 text-xs text-gray-500">{new Date(data.createdAt).toLocaleString("th-TH")}</td>
      <td className="p-3 font-mono text-xs text-gray-700">{data.surID}</td>
      <td className="p-3 font-semibold text-gray-800">{data.store_name}</td>
      <td className="p-3 text-gray-600">{data.contact}</td>
      <td className="p-3 text-gray-600">{data.phone}</td>
      <td className="p-3 text-gray-700 whitespace-pre-line">{data.address}</td>
      <td className="p-3 text-xs text-blue-800">{data.lat}</td>
      <td className="p-3 text-xs text-blue-800">{data.lng}</td>
      <td className="p-3">
        <button
          className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 text-white px-3 py-1.5 rounded-xl shadow-md font-semibold focus:outline focus:ring-2 focus:ring-emerald-300"
          onClick={() => alert(data.interest_products.map(p => p.name).join("\n"))}
          title="ดูสินค้าที่สนใจ"
        >
          🛍️ ดูสินค้า
          <span className="bg-white text-emerald-500 rounded-full px-2 ml-2 text-xs font-bold border border-emerald-200 shadow">
            {data.interest_products.length}
          </span>
        </button>
      </td>
      <td className="p-3">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white px-3 py-1.5 rounded-xl shadow-md font-semibold focus:outline focus:ring-2 focus:ring-blue-300"
          title="เปิด Google Maps"
        >
          📍 เดินทาง
        </a>
      </td>
    </tr>
  );
}

export default function ContactTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  const { data, error, isLoading } = useSWR(
    `/api/servey/report/contact?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    fetcher
  );

  const rows = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPage: 1, total: 0 };

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <div className="mb-3 flex flex-wrap gap-2 items-end">
        <input
          className="border border-blue-200 focus:ring-2 focus:ring-blue-300 outline-none rounded-lg px-3 py-2 text-base shadow"
          placeholder="🔍 ค้นหาชื่อร้านค้า..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ minWidth: 220 }}
        />
        <span className="text-sm text-gray-500 ml-2">{pagination.total} ร้านค้า</span>
      </div>
      <div className="overflow-x-auto bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-2xl border border-blue-100">
        <table className="min-w-[1000px] w-full text-sm border-separate border-spacing-0 rounded-3xl overflow-hidden">
          <caption className="text-left px-4 py-2 text-blue-600 font-medium caption-top bg-white rounded-t-3xl mb-1 shadow-sm">
            รายงานร้านค้าทั้งหมด (คลิก “ดูสินค้า” หรือ “เดินทาง”)
          </caption>
          <thead>
            <tr className="bg-blue-200 text-gray-900 text-base font-bold rounded-t-3xl shadow-sm">
              <th className="p-3 rounded-tl-2xl">วันที่สร้าง</th>
              <th className="p-3">ID</th>
              <th className="p-3">ชื่อร้านค้า</th>
              <th className="p-3">ผู้ติดต่อ</th>
              <th className="p-3">เบอร์โทร</th>
              <th className="p-3">ที่อยู่</th>
              <th className="p-3">Latitude</th>
              <th className="p-3">Longitude</th>
              <th className="p-3">สินค้าที่สนใจ</th>
              <th className="p-3 rounded-tr-2xl">เดินทาง</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400 bg-white">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <ContactTableRow data={row} key={i} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex gap-2 mt-6 items-center justify-center">
        <button
          className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-blue-100 font-bold shadow disabled:opacity-40"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ⬅️ ก่อนหน้า
        </button>
        <span className="font-medium text-gray-700">
          หน้า <span className="text-blue-600">{pagination.page}</span> / {pagination.totalPage}
        </span>
        <button
          className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-blue-100 font-bold shadow disabled:opacity-40"
          onClick={() => setPage(p => Math.min(pagination.totalPage, p + 1))}
          disabled={page >= pagination.totalPage}
        >
          ถัดไป ➡️
        </button>
      </div>
    </div>
  );
}
