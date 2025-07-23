"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// List สินค้า default (กรณีไม่ได้ส่งมาจาก props)
const defaultProductList = [
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

const sources = [
  { value: "Sales Foremost", label: "Sales Foremost" },
  { value: "ร้านMT (Makro,Lotus,Big C)", label: "ร้านMT (Makro,Lotus,Big C)" },
  { value: "ร้านขายส่งในท้องถิ่น", label: "ร้านขายส่งในท้องถิ่น" },
  { value: "Online", label: "Online" },
];

const customerNeeds = [
  { value: "buy", label: "ต้องการ" },
  { value: "not_buy", label: "ไม่ต้องการ" },
];

export default function Step3MarketInfo({
  storeInfo = {},
  products = [],
  userId,
  onBack,
  onSubmit,
  data = {},
  productList = defaultProductList,
}) {
  // State หลัก
  const [marketInfo, setMarketInfo] = useState({
    reason: data?.reason || "",
    demand: data?.demand || "",
    contact: data?.contact || "",
    phone: data?.phone || "",
    interest_products:
      data?.interest_products?.length === productList.length
        ? data.interest_products
        : productList.map((name) => ({ name, qty: "" })),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate
  const isValidPhone = (phone) => /^0[0-9]{8,9}$/.test(phone);
  const needContact = marketInfo.demand === "buy";

  // ปรับใหม่ ไม่บังคับกรอกจำนวนสินค้า
  const disableSubmit =
    submitting ||
    (needContact && (!marketInfo.contact || !isValidPhone(marketInfo.phone))) ||
    !userId;

  // แจ้งเตือนกรณีไม่กรอกจำนวนสินค้าเลย (แค่เตือน ไม่บล็อก)
  const showQtyWarning = marketInfo.interest_products.every(
    (p) => !p.qty || Number(p.qty) === 0
  );

  // Handle change qty
  const handleQtyChange = (idx, value) => {
    const updated = [...marketInfo.interest_products];
    updated[idx].qty = value !== "" ? Number(value) : "";
    setMarketInfo({ ...marketInfo, interest_products: updated });
  };

  // Mapping products ให้อยู่ใน schema backend
  const mappedProducts = products.map((prod) => ({
    product_id: prod.fmProID || prod.product_id || "",
    status: prod.status || "",
    priceBox: Number(prod.priceBox) || 0,
    pricePack: Number(prod.pricePack) || 0,
    priceCarton: Number(prod.priceCarton) || 0,
    statusFMFR: prod.statusFMFR || "",
    statusOMG: prod.statusOMG || "",
  }));

  // Mapping interest_products
  const mappedInterestProducts = marketInfo.interest_products.map((item) => ({
    name: item.name,
    qty: Number(item.qty) || 0,
  }));

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("ไม่พบรหัส user_id กรุณาย้อนกลับไปสร้างข้อมูลร้านค้าก่อน");
      return;
    }
    if (disableSubmit) {
      return;
    }
    setSubmitting(true);
    try {
      // สร้าง market_info payload
      const marketPayload = {
        ...marketInfo,
        interest_products: mappedInterestProducts,
      };

      // เรียก onSubmit callback รับ market_info
      if (onSubmit) {
        await onSubmit(marketPayload);
        setSuccess("ส่งข้อมูลสำเร็จ 🎉");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg w-full mx-auto py-10 px-4 sm:px-6"
      autoComplete="off"
    >
      <div className="mb-8 text-center">
        <h2 className="font-extrabold text-2xl sm:text-3xl text-gray-800 mb-1 tracking-tight">
          ข้อมูลการตลาด
        </h2>
        <div className="text-sm text-gray-400">
          * กรอกข้อมูลเพื่อประเมินตลาดสินค้า
        </div>
      </div>
      {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
      {success && <div className="mb-4 text-green-600 text-center">{success}</div>}

      {/* ที่มาของสินค้า */}
      <div className="mb-6">
        <label
          htmlFor="market-reason"
          className="font-semibold text-gray-700 mb-2 block"
        >
          ที่มาของสินค้า{" "}
          <span className="font-normal text-xs text-gray-400">
            (กรณีมีขาย / สินค้าหมด)
          </span>
        </label>
        <Select
          value={marketInfo.reason}
          onValueChange={(val) =>
            setMarketInfo({ ...marketInfo, reason: val })
          }
          required
          id="market-reason"
        >
          <SelectTrigger className="w-full rounded-xl border-2 px-4 py-3 bg-white shadow focus:ring-2 focus:ring-blue-100 text-base">
            <SelectValue placeholder="กรุณาระบุที่มาของสินค้า" />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-xl shadow-lg border p-0 text-base">
            {sources.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="cursor-pointer px-4 py-2 text-gray-700 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 rounded-lg"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-10 space-y-4">
        <div>
          <label
            htmlFor="contact-name"
            className="block font-semibold text-gray-700 mb-1"
          >
            ชื่อผู้ติดต่อ
          </label>
          <input
            type="text"
            id="contact-name"
            className="w-full rounded-xl border-2 px-4 py-3 text-base bg-white focus:ring-2 focus:ring-blue-100 focus:border-primary"
            placeholder="กรอกชื่อผู้ติดต่อ"
            value={marketInfo.contact}
            onChange={(e) =>
              setMarketInfo({ ...marketInfo, contact: e.target.value })
            }
            required={needContact}
            aria-label="ชื่อผู้ติดต่อ"
          />
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="block font-semibold text-gray-700 mb-1"
          >
            เบอร์โทรศัพท์
          </label>
          <input
            type="tel"
            id="contact-phone"
            className="w-full rounded-xl border-2 px-4 py-3 text-base bg-white focus:ring-2 focus:ring-blue-100 focus:border-primary"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={marketInfo.phone}
            onChange={(e) =>
              setMarketInfo({ ...marketInfo, phone: e.target.value })
            }
            pattern="0[0-9]{8,9}"
            maxLength={10}
            required={needContact}
            aria-label="เบอร์โทรศัพท์"
          />
          {marketInfo.phone && !isValidPhone(marketInfo.phone) && (
            <div className="text-xs text-red-500 mt-1">
              กรุณากรอกเบอร์มือถือ 10 หลัก
            </div>
          )}
        </div>
      </div>

      {/* ความต้องการซื้อของลูกค้า */}
      <div className="mb-6">
        <label className="font-semibold text-gray-700 mb-2 block">
          ท่านต้องการให้ Sales Foremost ติดต่อกลับ
        </label>
        <div className="flex gap-4">
          {customerNeeds.map((item) => {
            const checked = marketInfo.demand === item.value;
            return (
              <label
                key={item.value}
                className={`
                  flex items-center cursor-pointer rounded-xl border px-4 py-2 font-medium text-base
                  select-none
                  ${
                    checked
                      ? "bg-[#0094E5] text-white border-[#0094E5] shadow"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#0094E5]"
                  }
                `}
              >
                <input
                  type="radio"
                  name="market-demand"
                  value={item.value}
                  checked={checked}
                  onChange={() =>
                    setMarketInfo({ ...marketInfo, demand: item.value })
                  }
                  className="hidden"
                  required
                />
                {item.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* รายการสินค้า */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200 max-w-md mx-auto">
        <div className="text-center mb-4 font-semibold text-gray-700 text-lg">
          สินค้าที่สนใจ
        </div>
        <div className="grid grid-cols-[70%_30%] gap-2 font-bold text-gray-700 border-b border-gray-300 pb-2 mb-2">
          <div>สินค้า</div>
          <div className="text-center">จำนวนแพ็ค</div>
        </div>
        <div className="divide-y divide-gray-200">
          {marketInfo.interest_products.map((item, idx) => (
            <div
              key={item.name}
              className="grid grid-cols-[70%_30%] items-center py-3"
            >
              <div className="pr-3 truncate text-sm font-medium text-gray-800">
                {item.name}
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={item.qty}
                  onChange={(e) => handleQtyChange(idx, e.target.value)}
                  className="w-20 rounded-lg bg-gray-100 text-right font-semibold text-gray-700 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  inputMode="numeric"
                  aria-label={`จำนวนแพ็คของ ${item.name}`}
                  id={`qty_${idx}`}
                />
              </div>
            </div>
          ))}
        </div>
        {showQtyWarning && (
          <div className="mt-3 text-xs text-yellow-600 text-center">
            * แนะนำให้กรอกจำนวนสินค้าอย่างน้อย 1 รายการ
          </div>
        )}
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-between gap-3 mt-8">
        <button
          type="button"
          className="flex-1 py-3 rounded-2xl border border-gray-300 bg-white font-semibold text-gray-600 hover:bg-gray-50 shadow"
          onClick={onBack}
          disabled={submitting}
        >
          ย้อนกลับ
        </button>
        <button
          type="submit"
          className={`flex-1 py-3 rounded-2xl font-semibold shadow transition ${
            disableSubmit
              ? "bg-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-[#0094E5] text-white hover:bg-[#0094E5]/90"
          }`}
          disabled={disableSubmit}
        >
          {submitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
        </button>
      </div>
    </form>
  );
}
