import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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
  "Foremost ช็อกโกแลตผสมธัญพืชรวม 180ml"
];

const sources = [
  { value: "factory", label: "โรงงาน" },
  { value: "wholesale", label: "ร้านขายส่ง" },
  { value: "dealer", label: "ดีลเลอร์" },
  { value: "other", label: "อื่นๆ" },
];

const customerNeeds = [
  { value: "buy", label: "ต้องการให้เซลล์ติดต่อกลับ" },
  { value: "not_buy", label: "ไม่ต้องการ/ไม่สนใจ" },
];

export default function Step3MarketInfo({
  data,
  onBack,
  onSubmit,
  products = defaultProductList
}) {
  const [marketInfo, setMarketInfo] = useState({
    reason: data?.reason || "",
    demand: data?.demand || "",
    contact: data?.contact || "",
    phone: data?.phone || "",
    interest_products:
      data?.interest_products?.length === products.length
        ? data.interest_products
        : products.map(name => ({ name, qty: "" }))
  });

  const isValidPhone = (phone) => /^0[0-9]{8,9}$/.test(phone);
  const needContact = marketInfo.demand === "buy";

  const handleQtyChange = (idx, value) => {
    const updated = [...marketInfo.interest_products];
    updated[idx].qty = value !== "" ? Number(value) : "";
    setMarketInfo({ ...marketInfo, interest_products: updated });
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(marketInfo);
      }}
      className="max-w-lg w-full mx-auto py-10 px-4 sm:px-6"
    >
      <div className="mb-8 text-center">
        <h2 className="font-extrabold text-2xl sm:text-3xl text-gray-800 mb-1 tracking-tight">ข้อมูลการตลาด</h2>
        <div className="text-sm text-gray-400">* กรอกข้อมูลเพื่อประเมินตลาดสินค้า</div>
      </div>



      {/* --- ที่มาของสินค้า --- */}
      <div className="mb-6">
        <label className="font-semibold text-gray-700 mb-2 block">
          ที่มาของสินค้า <span className="font-normal text-xs text-gray-400">(กรณีมีขาย / สินค้าหมด)</span>
        </label>
        <Select
          value={marketInfo.reason}
          onValueChange={val => setMarketInfo({ ...marketInfo, reason: val })}
          required
        >
          <SelectTrigger className="w-full rounded-xl border-2 px-4 py-3 bg-white shadow focus:ring-2 focus:ring-blue-100 text-base">
            <SelectValue placeholder="กรุณาระบุที่มาของสินค้า" />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-xl shadow-lg border p-0 text-base">
            {sources.map(item => (
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

      {/* --- ความต้องการซื้อของลูกค้า --- */}
      <div className="mb-6">
        <label className="font-semibold text-gray-700 mb-2 block">
          ความต้องการซื้อของลูกค้า
        </label>
        <Select
          value={marketInfo.demand}
          onValueChange={val => setMarketInfo({ ...marketInfo, demand: val })}
          required
        >
          <SelectTrigger className="w-full rounded-xl border-2 px-4 py-3 bg-white shadow focus:ring-2 focus:ring-blue-100 text-base">
            <SelectValue placeholder="กรุณาระบุความต้องการ" />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-xl shadow-lg border p-0 text-base">
            {customerNeeds.map(item => (
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

      {/* --- ถ้าเลือก "ต้องการ" ให้โชว์ช่องกรอกชื่อ เบอร์ --- */}
      {needContact && (
        <div className="mb-10 space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
            <input
              type="text"
              className="w-full rounded-xl border-2 px-4 py-3 text-base bg-white focus:ring-2 focus:ring-blue-100 focus:border-primary"
              placeholder="กรอกชื่อผู้ติดต่อ"
              value={marketInfo.contact}
              onChange={e => setMarketInfo({ ...marketInfo, contact: e.target.value })}
              required={needContact}
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              className="w-full rounded-xl border-2 px-4 py-3 text-base bg-white focus:ring-2 focus:ring-blue-100 focus:border-primary"
              placeholder="กรอกเบอร์โทรศัพท์"
              value={marketInfo.phone}
              onChange={e => setMarketInfo({ ...marketInfo, phone: e.target.value })}
              pattern="0[0-9]{8,9}"
              maxLength={10}
              required={needContact}
            />
            {marketInfo.phone && !isValidPhone(marketInfo.phone) && (
              <div className="text-xs text-red-500 mt-1">กรุณากรอกเบอร์มือถือ 10 หลัก</div>
            )}
          </div>
        </div>
      )}

            {/* ----------- สินค้า / จำนวนแพ็ค (Stacked layout) ----------- */}
      <div className="bg-white/90 rounded-2xl p-4 mb-8 shadow-lg border border-gray-100">
        <div className="font-bold text-base sm:text-lg mb-4 text-gray-700">
          <span className="inline-block w-[70%]">สินค้า</span>
          <span className="inline-block w-[30%] text-center">จำนวนแพ็ค</span>
        </div>
        <div className="divide-y divide-gray-100">
          {marketInfo.interest_products.map((item, idx) => (
            <div className="flex items-center py-2 gap-2" key={item.name}>
              <div className="w-[70%] pr-2 truncate text-[15px] font-medium">{item.name}</div>
              <div className="w-[30%] flex justify-center">
                <input
                  type="number"
                  min={0}
                  className="w-24 bg-gray-100 rounded-xl px-3 py-2 text-base text-right font-semibold focus:outline-none focus:ring-2 focus:ring-primary border-2 border-transparent focus:border-primary transition placeholder:text-gray-400"
                  placeholder="-"
                  value={item.qty}
                  onChange={e => handleQtyChange(idx, e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3 mt-8">
        <button
          type="button"
          className="flex-1 py-3 rounded-2xl border border-gray-300 bg-white font-semibold text-gray-600 hover:bg-gray-50 shadow"
          onClick={onBack}
        >
          ย้อนกลับ
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-2xl bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
          disabled={needContact && (!marketInfo.contact || !isValidPhone(marketInfo.phone))}
        >
          ส่งข้อมูล
        </button>
      </div>
    </form>
  );
}
