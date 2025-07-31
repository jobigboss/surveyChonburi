import React, { useEffect, useState } from "react";

function safeNumber(val) {
  return typeof val === "number" ? val.toLocaleString() : "0";
}
function safePercent(num, total) {
  if (!total || typeof num !== "number") return "0%";
  return ((num * 100) / total).toFixed(1) + "%";
}

const products = ["FMFR", "OMG"];
const statuses = [
  { key: "available", label: "มี" },
  { key: "out_of_stock", label: "สินค้าหมด" },
  { key: "discontinued", label: "เลิกขาย" },
  { key: "never_sold", label: "ไม่เคยขาย" },
];

function ProductPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/servey/report/product")
      .then(res => res.json())
      .then(res => setData(res.data));
  }, []);

  return (
    <div className="p-4 grid gap-8 md:grid-cols-2">
      {data.map((prov) =>
        prov.amphurs?.map((a) => (
          <div key={prov.province + "-" + a.name} className="bg-white rounded-2xl shadow p-4 mb-8">
            <h2 className="text-lg font-bold mb-2 text-primary">
              จังหวัด {prov.province} - อำเภอ {a.name}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left border-b min-w-[120px]">อำเภอ/เขต</th>
                    <th className="p-2 text-right border-b">จำนวน Distributions</th>
                    {products.map((prod) =>
                      statuses.map((s) => (
                        <React.Fragment key={prod + s.key}>
                          <th className="p-2 text-right border-b">{prod} - {s.label}</th>
                          <th className="p-2 text-right border-b">%</th>
                        </React.Fragment>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {a.districts?.map((d) => {
                    // Distributions: รวมทุก status ของทั้ง 2 product
                    const distTotal =
                      products.reduce(
                        (prodSum, prod) =>
                          prodSum +
                          statuses.reduce(
                            (statSum, s) =>
                              statSum + (d.products?.[prod]?.[s.key] || 0),
                            0
                          ),
                        0
                      );
                    return (
                      <tr key={a.name + "-" + d.name}>
                        <td className="p-2">{d.name}</td>
                        <td className="p-2 text-right font-bold">{safeNumber(distTotal)}</td>
                        {products.map((prod) => {
                          const counts = d.products?.[prod] || {};
                          const total =
                            statuses.reduce((sum, s) => sum + (counts[s.key] || 0), 0) || 0;
                          return statuses.map((s) => (
                            <React.Fragment key={prod + s.key}>
                              <td className="p-2 text-right">{safeNumber(counts[s.key])}</td>
                              <td className="p-2 text-right">{safePercent(counts[s.key], total)}</td>
                            </React.Fragment>
                          ));
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductPage;
