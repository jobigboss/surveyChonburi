"use client";
import React from "react";
import { useEffect, useState } from "react";

export default function ProductSummaryReportPage() {
  const [shopSizeSummary, setShopSizeSummary] = useState({});
  const [statusSummary, setStatusSummary] = useState({});
  const [productSummary, setProductSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [shopRes, statusRes, productRes] = await Promise.all([
          fetch("/api/servey/report/summary/shop"),
          fetch("/api/servey/report/summary/status"),
          fetch("/api/servey/report/summary/product"),
        ]);
        const shopJson = await shopRes.json();
        const statusJson = await statusRes.json();
        const productJson = await productRes.json();

        setShopSizeSummary(shopJson.data || {});
        setStatusSummary(statusJson.data || {});
        setProductSummary(productJson.data || {});
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const renderHeader = (headers) => (
    <tr className="bg-gray-100 text-center text-sm">
      {headers.map((h, i) => (
        <th key={i} className="border p-1 whitespace-nowrap">{h}</th>
      ))}
    </tr>
  );

  const calcStats = (arr = []) => {
    if (arr.length === 0) return { avg: "-", min: "-", max: "-", mode: "-" };
    const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const mode = arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
    return { avg, min, max, mode };
  };

  const totalShops = Object.values(shopSizeSummary)
    .flatMap(districts => Object.values(districts))
    .reduce((sum, shop) => sum + Object.values(shop).reduce((s, c) => s + c, 0), 0);

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-bold">📊 รายงานสรุป Survey</h2>

      {/* --- 1. ขนาดร้าน --- */}
      <section>
        <h3 className="text-lg font-semibold mb-2">1️⃣ สรุปตามขนาดร้าน</h3>
        {Object.entries(shopSizeSummary).map(([province, districtData]) => (
          <div key={province} className="mb-4">
            <p className="font-bold text-blue-600">{province}</p>
            <table className="w-full border text-sm">
              <thead>
                {renderHeader(["อำเภอ", "A", "%", "B", "%", "C", "%", "D", "%", "E", "%", "F", "%", "รวม", "%"])}
              </thead>
              <tbody>
                {Object.entries(districtData).map(([district, sizeData]) => {
                  const total = Object.values(sizeData).reduce((sum, v) => sum + v, 0);
                  return (
                    <tr key={district} className="text-center">
                      <td className="border p-1">{district}</td>
                      {["A", "B", "C", "D", "E", "F"].map(size => (
                        <React.Fragment key={`${district}-${size}`}>
                          <td className="border">{sizeData[size] || 0}</td>
                          <td className="border">
                            {total ? ((sizeData[size] || 0) * 100 / total).toFixed(1) + "%" : "0%"}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border">{total}</td>
                      <td className="border">100%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* --- 2. สถานะ --- */}
      <section>
        <h3 className="text-lg font-semibold mb-2">2️⃣ สถานะการจำหน่าย FMFR / OMG</h3>
        {Object.entries(statusSummary).map(([province, districtData]) => (
          <div key={province} className="mb-4">
            <p className="font-bold text-blue-600">{province}</p>
            <table className="w-full border text-sm">
              <thead>
                {renderHeader([
                  "อำเภอ",
                  "FMFR-ขาย", "%", "FMFR-หมด", "%", "FMFR-เลิก", "%", "FMFR-ไม่เคย", "%",
                  "OMG-ขาย", "%", "OMG-หมด", "%", "OMG-เลิก", "%", "OMG-ไม่เคย", "%",
                  "รวม", "%"
                ])}
              </thead>
              <tbody>
                {Object.entries(districtData).map(([district, statusData]) => {
                  const keys = [
                    "FMFR_ขาย", "FMFR_สินค้าหมด", "FMFR_เลิกขาย", "FMFR_ไม่เคยขาย",
                    "OMG_ขาย", "OMG_สินค้าหมด", "OMG_เลิกขาย", "OMG_ไม่เคยขาย"
                  ];
                  const total = keys.reduce((sum, k) => sum + (statusData[k] || 0), 0);
                  return (
                    <tr key={district} className="text-center">
                      <td className="border p-1">{district}</td>
                      {keys.map(k => (
                        <React.Fragment key={`${district}-${k}`}>
                          <td className="border">{statusData[k] || 0}</td>
                          <td className="border">
                            {total ? ((statusData[k] || 0) * 100 / total).toFixed(1) + "%" : "0%"}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border">{total}</td>
                      <td className="border">100%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* --- 3. สินค้า --- */}
      <section>
        <h3 className="text-lg font-semibold mb-2">3️⃣ สินค้าที่มีขายและราคา</h3>
        <table className="w-full border text-sm">
          <thead>
            {renderHeader([
              "สินค้า", "จำนวน Distribution", "%", 
              "กล่อง Avg", "min", "max", "mode",
              "แพ็ค Avg", "min", "max", "mode",
              "ลัง Avg", "min", "max", "mode"
            ])}
          </thead>
          <tbody>
            {productSummary.map(({ id, name, count, priceBox, pricePack, priceCarton }) => {
            const box = calcStats(priceBox);
            const pack = calcStats(pricePack);
            const carton = calcStats(priceCarton);
            const percent = totalShops ? (count * 100 / totalShops).toFixed(1) + "%" : "0%";
            return (
                <tr key={id} className="text-center">
                <td className="border p-1">{name}</td>
                <td className="border">{count}</td>
                <td className="border">{percent}</td>
                {[box, pack, carton].map((p, i) => (
                    <React.Fragment key={`price-${id}-${i}`}>
                    <td className="border">{p.avg}</td>
                    <td className="border">{p.min}</td>
                    <td className="border">{p.max}</td>
                    <td className="border">{p.mode}</td>
                    </React.Fragment>
                ))}
                </tr>
            );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
