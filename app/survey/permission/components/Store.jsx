"use client";
import { useState } from "react";
import { Camera, X } from "lucide-react"; // <- สำคัญ!

const foremostBlue = "#0094E5";
const foremostOrange = "#FF9100";
const darkText = "#222";

// --- Shop size แบบใหม่ ---
const SHOP_SIZE_OPTIONS = [
  {  value: "A",
    label: "A",
    desc: "ร้านขายของชำทั่วไป มีพื้นที่ 1-2 คูหา",
    images: [
      "/images/shopA-1.png",
      "/images/shopA-2.png",
      "/images/shopA-3.png"
    ]
  },
  { value: "B", label: "B", desc: "ร้านขนาดกลาง", images: [] },
  { value: "C", label: "C", desc: "ร้านขนาดเล็ก", images: [] },
  { value: "D", label: "D", desc: "รถเร่", images: [] },
  { value: "E", label: "E", desc: "ร้านใหม่", images: [] },
  { value: "F", label: "F", desc: "อื่นๆ", images: [] }
];

const SPECIAL_TYPE = [
  { value: "ธงฟ้า", label: "ร้านธงฟ้า" },
  { value: "ติดดาว", label: "ร้านติดดาว" },
  { value: "โชคชัย", label: "ร้านโชคชัย" },
  { value: "ถูกดี", label: "ร้านถูกดี" },
];

export default function Step1StoreInfo({ data, onNext }) {
  const [storeInfo, setStoreInfo] = useState(data || {});
  const [showFreezer, setShowFreezer] = useState(!!storeInfo.store_freezer);
  const [showShelf, setShowShelf] = useState(!!storeInfo.store_shelf);

  // image preview
  const handleImage = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStoreInfo((prev) => ({ ...prev, [field]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSpecialType = (e) => {
    const { value, checked } = e.target;
    let selected = storeInfo.special_type || [];
    if (checked) {
      selected = [...selected, value];
    } else {
      selected = selected.filter((item) => item !== value);
    }
    setStoreInfo((prev) => ({ ...prev, special_type: selected }));
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onNext(storeInfo);
      }}
      className="min-h-[95vh] flex items-center justify-center bg-[#f5fafd] px-2"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl px-5 py-8 flex flex-col gap-5">
        <div className="text-center mb-3">
          <img src="https://www.foremostthailand.com/wp-content/uploads/2022/03/footer-icon_foremost-e1648914092691.png" className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-[#f0f6ff] shadow" alt="Foremost" />
          <h2 className="font-extrabold text-2xl" style={{ color: foremostBlue }}>
            ข้อมูลร้านค้า
          </h2>
        </div>
        <FormInput label="ชื่อร้าน *" value={storeInfo.store_name} onChange={v => setStoreInfo({ ...storeInfo, store_name: v })} required />
        <FormInput label="บ้านเลขที่" value={storeInfo.store_number_address} onChange={v => setStoreInfo({ ...storeInfo, store_number_address: v })} />
        <FormInput label="หมู่ที่" value={storeInfo.store_number_moo} onChange={v => setStoreInfo({ ...storeInfo, store_number_moo: v })} />
        <FormInput label="จังหวัด" value={storeInfo.store_province} onChange={v => setStoreInfo({ ...storeInfo, store_province: v })} />
        <FormInput label="อำเภอ" value={storeInfo.store_district} onChange={v => setStoreInfo({ ...storeInfo, store_district: v })} />
        <FormInput label="ตำบล" value={storeInfo.store_subdistrict} onChange={v => setStoreInfo({ ...storeInfo, store_subdistrict: v })} />
        <FormInput label="ที่ตั้งร้าน/รายละเอียดสถานที่" value={storeInfo.location_address} onChange={v => setStoreInfo({ ...storeInfo, location_address: v })} />
        <div className="flex gap-2">
          <FormInput label="Latitude" type="number" value={storeInfo.lat} onChange={v => setStoreInfo({ ...storeInfo, lat: v })} />
          <FormInput label="Longitude" type="number" value={storeInfo.lng} onChange={v => setStoreInfo({ ...storeInfo, lng: v })} />
        </div>

        <FormUpload
          label="ถ่ายรูปร้านค้า"
          value={storeInfo.photo_store}
          onChange={e => handleImage(e, "photo_store")}
          onRemove={() => setStoreInfo(prev => ({ ...prev, photo_store: null }))}
        />


        <ShopSizeSelect
          value={storeInfo.shop_size}
          onChange={v => setStoreInfo({ ...storeInfo, shop_size: v })}
        />

        <div>
          <div className="text-base font-semibold mb-1" style={{ color: foremostBlue }}>ประเภทร้านค้า</div>
          <div className="flex flex-wrap gap-3">
            {SPECIAL_TYPE.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={storeInfo.special_type?.includes(opt.value) || false}
                  onChange={handleSpecialType}
                  style={{ accentColor: foremostOrange, width: 20, height: 20 }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <FormSelect
          label="มีตู้แช่?"
          value={storeInfo.store_freezer || ""}
          onChange={v => {
            setStoreInfo({ ...storeInfo, store_freezer: v });
            setShowFreezer(v === "มี");
          }}
          options={[
            { value: "", label: "เลือก" },
            { value: "มี", label: "มี" },
            { value: "ไม่มี", label: "ไม่มี" },
          ]}
          required
        />
        {showFreezer && (
          <FormUpload
            label="ถ่ายรูปตู้แช่"
            value={storeInfo.photo_freezer}
            onChange={e => handleImage(e, "photo_freezer")}
            onRemove={() => setStoreInfo(prev => ({ ...prev, photo_freezer: null }))}
          />
        )}

        <FormSelect
          label="มีชั้นวางนม UHT?"
          value={storeInfo.store_shelf || ""}
          onChange={v => {
            setStoreInfo({ ...storeInfo, store_shelf: v });
            setShowShelf(v === "มี");
          }}
          options={[
            { value: "", label: "เลือก" },
            { value: "มี", label: "มี" },
            { value: "ไม่มี", label: "ไม่มี" },
          ]}
          required
        />
        {showShelf && (
          <FormUpload
            label="ถ่ายรูปชั้นวาง"
            value={storeInfo.photo_shelf}
            onChange={e => handleImage(e, "photo_shelf")}
            onRemove={() => setStoreInfo(prev => ({ ...prev, photo_shelf: null }))}
          />
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-lg shadow-lg mt-2"
          style={{
            background: foremostBlue,
            color: "#fff",
            letterSpacing: "1px",
          }}
        >
          ถัดไป
        </button>
      </div>
    </form>
  );
}

// --- Components ใช้ร่วม (ให้ UI เด่น) ---

function FormInput({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block text-base mb-1 font-semibold" style={{ color: "#1a355e" }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#dde8f5] px-3 py-2 text-[16px] focus:ring-2 focus:ring-[#0094E5]/30 outline-none bg-[#f7fbff]"
        style={{
          color: darkText,
          background: "#f7fbff",
          fontWeight: 500,
        }}
        required={required}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [], required }) {
  return (
    <div>
      <label className="block text-base mb-1 font-semibold" style={{ color: "#1a355e" }}>
        {label}
      </label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#dde8f5] px-3 py-2 text-[16px] focus:ring-2 focus:ring-[#0094E5]/30 outline-none bg-[#f7fbff]"
        style={{ color: darkText, fontWeight: 500 }}
        required={required}
      >
        <option value="" disabled>เลือก</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function FormUpload({ label, value, onChange, onRemove }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-base font-semibold mb-2" style={{ color: "#1a355e" }}>
        {label}
      </div>

      {/* ถ้ายังไม่มีรูป: แสดงปุ่มถ่ายรูปขนาดใหญ่เต็มจอ mobile (สูงสุด 320px) */}
      {!value && (
        <label
          className="flex flex-col items-center justify-center w-80 max-w-[95vw] h-80 max-h-[50vw] sm:max-h-[320px] rounded-2xl border-2 border-dashed border-[#dde8f5] bg-[#f7fbff] cursor-pointer hover:bg-[#f0f7fd] transition relative"
          style={{ minHeight: 180 }}
        >
          <Camera color="#FF9100" size={64} />
          <span className="text-lg mt-3 text-[#888] font-medium">ถ่ายรูป</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            tabIndex={-1}
          />
        </label>
      )}

      {/* ถ้ามีรูป: แสดงรูปใหญ่ พร้อมปุ่ม X ลบมุมขวาบน */}
      {value && (
        <div className="relative w-80 max-w-[95vw] h-80 max-h-[60vw] sm:max-h-[350px] mb-2">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover rounded-2xl shadow-md border"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="ลบรูป"
            className="absolute top-2 right-2 bg-white rounded-full p-2 border border-red-300 shadow hover:bg-red-100 transition z-10"
          >
            <X color="#f43f5e" size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

function ShopSizeSelect({ value, onChange }) {
  const selected = SHOP_SIZE_OPTIONS.find(opt => opt.value === value);

  return (
    <div className="mb-4">
      <div className="text-base font-bold mb-2" style={{ color: "#0094E5" }}>
        ลักษณะร้านค้าที่ท่านพบเจอ
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        {SHOP_SIZE_OPTIONS.map(opt => (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`border rounded-lg px-4 py-2 font-semibold text-lg transition
              ${value === opt.value
                ? "border-[#0094E5] bg-[#e5f4fa] text-[#0094E5] shadow"
                : "border-[#cfe5f8] bg-white text-[#1a355e] hover:bg-[#f7fbff]"}`
            }
            style={{ minWidth: 48 }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-1 mb-2">
          <div className="text-[#0094E5] font-medium mb-1">
            คุณเลือก: {selected.desc}
          </div>
          {selected.images && selected.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selected.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`ตัวอย่างร้าน${selected.label}-${idx + 1}`}
                  className="rounded-lg border shadow-sm object-cover w-full aspect-[4/3]"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
