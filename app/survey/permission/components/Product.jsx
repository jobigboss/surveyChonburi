"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Step2Products({ onBack, onNext }) {
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({});
  // เปลี่ยนชื่อ state ตามที่ต้องการ
  const [statusFMFR, setStatusFMFR] = useState("");
  const [statusOMG, setStatusOMG] = useState("");
  const [statusFMFRKids, setStatusFMFRKids] = useState("");

  useEffect(() => {
    fetch("/api/servey/get/product")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // ฟังก์ชันเช็คสินค้าตาม owner/category
  const hasAvailableFMFR = products.some(
    (p) => p.Owner === "FMFR" && productData[p.fmProID]?.status === "available"
  );
  const hasAvailableFMFRKids = products.some(
    (p) =>
      p.Owner === "FMFR" &&
      p.fmCategory === "Kids" &&
      productData[p.fmProID]?.status === "available"
  );

  const surveyOptions = [
    { value: "out_of_stock", label: "สินค้าหมด" },
    { value: "never_sold", label: "ไม่เคยขาย" },
    { value: "discontinued", label: "ไม่ขายแล้ว" },
  ];

  // เปลี่ยนสถานะสินค้าแต่ละตัว
  const setStatus = (productId, value) => {
    setProductData((prev) => {
      if (value === "never_sold") {
        return {
          ...prev,
          [productId]: { status: value },
        };
      }
      return {
        ...prev,
        [productId]: { ...prev[productId], status: value },
      };
    });
  };

  // เปลี่ยนราคาสินค้า
  const handlePriceChange = (productId, key, value) => {
    setProductData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [key]: value !== "" ? Number(value) : "",
      },
    }));
  };

  // ส่งข้อมูลไปหน้า onNext
  const handleNext = () => {
    const result = products.map((p) => ({
      ...p,
      status: productData[p.fmProID]?.status || "",
      priceBox: productData[p.fmProID]?.priceBox || "",
      pricePack: productData[p.fmProID]?.pricePack || "",
      priceCarton: productData[p.fmProID]?.priceCarton || "",
    }));
    // ส่งค่าที่ rename แล้ว
    onNext({
      products: result,
      statusFMFR,
      statusOMG,
      statusFMFRKids,
    });
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">รายการสินค้า</h2>
      <div className="space-y-5 mb-6">
        {products.map((prod) => {
          const status = productData[prod.fmProID]?.status || "";
          const isAvailable = status === "available";
          const isOutOfStock = status === "out_of_stock";
          const canInputPrice = isAvailable || isOutOfStock;
          return (
            <Card
              key={prod.fmProID}
              className={`rounded-2xl shadow-md border transition hover:shadow-lg ${
                isAvailable
                  ? "border-green-500 bg-green-50"
                  : isOutOfStock
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <CardContent className="flex gap-4 p-4 items-center">
                <div className="flex-shrink-0">
                  <Image
                    src={prod.fmProImg || "/no-image.png"}
                    alt={prod.fmProName}
                    width={72}
                    height={72}
                    className="rounded-xl object-cover border bg-gray-50"
                    style={{ minWidth: 72, minHeight: 72 }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">{prod.fmProName}</div>
                  <div className="text-xs text-gray-500 mb-1">รหัส: {prod.fmProID}</div>
                  <div className="text-xs text-gray-400 mb-2">{prod.fmCategory}</div>
                  <div className="flex gap-4 items-center mb-2 mt-2">
                    <label
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={e => { e.stopPropagation(); setStatus(prod.fmProID, "never_sold"); }}
                    >
                      <input
                        type="radio"
                        name={`status-${prod.fmProID}`}
                        checked={status === "never_sold"}
                        readOnly
                      />
                      <span className="text-xs">ไม่เคยขาย</span>
                    </label>
                    <label
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={e => { e.stopPropagation(); setStatus(prod.fmProID, "out_of_stock"); }}
                    >
                      <input
                        type="radio"
                        name={`status-${prod.fmProID}`}
                        checked={status === "out_of_stock"}
                        readOnly
                      />
                      <span className="text-xs">สินค้าหมด</span>
                    </label>
                    <label
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={e => { e.stopPropagation(); setStatus(prod.fmProID, "available"); }}
                    >
                      <input
                        type="radio"
                        name={`status-${prod.fmProID}`}
                        checked={status === "available"}
                        readOnly
                      />
                      <span className="text-xs">มีขาย</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      className="border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/30"
                      placeholder="ราคากล่อง"
                      value={productData[prod.fmProID]?.priceBox || ""}
                      disabled={!canInputPrice}
                      onChange={e => handlePriceChange(prod.fmProID, "priceBox", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/30"
                      placeholder="ราคาแพ็ค"
                      value={productData[prod.fmProID]?.pricePack || ""}
                      disabled={!canInputPrice}
                      onChange={e => handlePriceChange(prod.fmProID, "pricePack", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="border rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/30"
                      placeholder="ราคาลัง"
                      value={productData[prod.fmProID]?.priceCarton || ""}
                      disabled={!canInputPrice}
                      onChange={e => handlePriceChange(prod.fmProID, "priceCarton", e.target.value)}
                    />
                  </div>
                  {!canInputPrice && (
                    <div className="text-xs text-red-400 mt-1">
                      กรอกได้เฉพาะสถานะ “มีขาย” หรือ “สินค้าหมด”
                    </div>
                  )}
                  <div className="mt-2 text-xs font-semibold">
                    {isAvailable
                      ? <span className="text-green-600">สถานะ: มีขาย</span>
                      : isOutOfStock
                      ? <span className="text-orange-600">สถานะ: สินค้าหมด</span>
                      : <span className="text-gray-400">สถานะ: ไม่เคยขาย</span>
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Survey Status Section */}
      <div className="mt-8 space-y-4">
        {!hasAvailableFMFR && (
          <div className="flex items-center gap-2">
            <span className="font-semibold min-w-[150px]">สถานะมีขาย FMFR</span>
            <select
              className="border rounded p-2 min-w-[170px]"
              value={statusFMFR}
              onChange={e => setStatusFMFR(e.target.value)}
            >
              <option value="">เลือกสถานะ</option>
              {surveyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        {!hasAvailableFMFRKids && (
          <div className="flex items-center gap-2">
            <span className="font-semibold min-w-[150px]">สถานะมีขาย OMG</span>
            <select
              className="border rounded p-2 min-w-[170px]"
              value={statusOMG}
              onChange={e => setStatusOMG(e.target.value)}
            >
              <option value="">เลือกสถานะ</option>
              {surveyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Button variant="outline" className="flex-1 py-2" onClick={onBack}>
          ย้อนกลับ
        </Button>
        <Button className="flex-1 py-2" onClick={handleNext}>
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
