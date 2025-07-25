"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";

const foremostBlue = "#0094E5";

const SHOP_SIZE_OPTIONS = [
  { value: "A", label: "A", desc: "ร้าน 1 คูหา หรือร้านของชำ", images: ["/images/shopA-1.png", "/images/shopA-2.png", "/images/shopA-3.png"] },
  { value: "B", label: "B", desc: "ร้าน 2 คูหา ขึ้นไป หรือ มินิมาร์ท", images: [] },
  { value: "C", label: "C", desc: "ซุปเปอร์มาร์เก็ต (ขายทั้งปลีกและส่ง)", images: [] },
  { value: "D", label: "D", desc: "ร้านยี่ปั้ว/ค้าส่ง", images: [] },
  { value: "E", label: "E", desc: "ร้านขายสินค้าเด็กโดยเฉพาะ", images: [] },
  { value: "F", label: "F", desc: "ร้านขายยา", images: [] },
];

const SPECIAL_TYPE = [
  { value: "ธงฟ้า", label: "ร้านธงฟ้า" },
  { value: "ติดดาว", label: "ร้านติดดาว" },
  { value: "โชคชัย", label: "ร้านโชคชัย" },
  { value: "ถูกดี", label: "ร้านถูกดี" },
];

const REASONS = [
  { value: "no_uht", label: "ไม่มีขาย สินค้านม UHT/FMFR" },
  { value: "scam_fear", label: "กลัวเป็นมิจฉาชีพ/สรรพากร" },
  { value: "closing", label: "ร้านเตรียมจะยกเลิกกิจการ" },
  { value: "owner_absent", label: "ไม่สามารถให้ข้อมูลได้ (เจ้าของร้านไม่อยู่)" },
];
const PRODUCT_STATUS_OPTIONS = [
  { value: "มีขาย", label: "มีขาย" },
  { value: "สินค้าหมด", label: "สินค้าหมด" },
  { value: "ไม่เคยขาย", label: "ไม่เคยขาย" },
  { value: "เลิกขาย", label: "เลิกขาย" },
];

export default function StepStoreNoPermission({ data = {}, onSave }) {
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get("user_id");

  const [storeInfo, setStoreInfo] = useState({
    ...data,
    user_id: userIdFromQuery || data.user_id || "",
    permission: "ไม่อนุญาต",
    permission_reason: "",
    shop_size: "",
    special_type: [],
    statusFMFR: "",
    statusOMG: "",
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [userRoute, setUserRoute] = useState("");
  const fileInputRef = useRef();

  // ✅ โหลดข้อมูล user เอา route มา filter จังหวัด
  useEffect(() => {
    if (!userIdFromQuery) return;
    fetch(`/api/servey/get/user?user_id=${userIdFromQuery}`)
      .then((res) => res.json())
      .then((user) => {
         const found = Array.isArray(user)
          ? user.find((u) => u.user_id === userIdFromQuery)
          : user;
        if (found?.route) setUserRoute(String(found.route).replace(",", ""));
      });
  }, [userIdFromQuery]);

  useEffect(() => {
    setStoreInfo((prev) => ({
      ...prev,
      ...data,
      user_id: userIdFromQuery || data.user_id || "",
      statusFMFR: prev.statusFMFR || data.statusFMFR || "",
      statusOMG: prev.statusOMG || data.statusOMG || "",
      permission: "ไม่อนุญาต",
    }));
  }, [JSON.stringify(data), userIdFromQuery]);

  // ✅ อัพโหลดรูป
  const handleImage = useCallback((e) => {
    const file = e.target.files[0];
    setPhotoError("");
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setPhotoError("ไฟล์ต้องเป็น JPEG เท่านั้น");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("ขนาดไฟล์รูปต้องไม่เกิน 3MB");
      return;
    }
    setStoreInfo((prev) => ({ ...prev, photo_store: file }));
    setTimeout(() => handleDetectLocation(), 200);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setStoreInfo((prev) => ({ ...prev, photo_store: null }));
    setTimeout(() => fileInputRef.current?.click(), 150);
  }, []);

  // ✅ ดึง GPS
  const handleDetectLocation = useCallback(() => {
    setGeoError("");
    setGeoLoading(true);
    if (!navigator.geolocation) {
      setGeoLoading(false);
      setGeoError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStoreInfo((prev) => ({ ...prev, lat: latitude, lng: longitude }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=th`
          );
          const data = await res.json();
          setStoreInfo((prev) => ({
            ...prev,
            location_address: data.display_name || ""
          }));
        } catch {
          setGeoError("ดึงที่อยู่ไม่สำเร็จ ลองใหม่อีกครั้ง");
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setGeoError("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตหรือเปิด GPS แล้วลองใหม่");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!storeInfo.lat || !storeInfo.lng) handleDetectLocation();
  }, []);

  // ✅ ประเภทร้านพิเศษ
  const handleSpecialType = (e) => {
    const { value, checked } = e.target;
    let selected = storeInfo.special_type || [];
    selected = checked ? [...selected, value] : selected.filter((item) => item !== value);
    setStoreInfo((prev) => ({ ...prev, special_type: selected }));
  };

  const isSaveDisabled =
    geoLoading ||
    !storeInfo.store_name ||
    !storeInfo.store_province ||
    !storeInfo.store_district ||
    !storeInfo.store_subdistrict ||
    !storeInfo.photo_store ||
    !storeInfo.permission_reason;

  const handleSave = () => {
    if (!isSaveDisabled && typeof onSave === "function") {
      const cleanData = {
        ...storeInfo,
        location: {
          lat: storeInfo.lat || null,
          lng: storeInfo.lng || null,
          address: storeInfo.location_address || "",
        },
      };
      delete cleanData.lat;
      delete cleanData.lng;
      delete cleanData.location_address;
      onSave(cleanData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5fafd]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="w-full max-w-md bg-white shadow-xl rounded-3xl px-5 py-8 flex flex-col gap-5"
      >
        <div className="text-center mb-3">
          <h2 className="font-extrabold text-2xl text-[#0094E5]">ข้อมูลร้านค้า (ไม่อนุญาต)</h2>
        </div>

        {/* ชื่อร้าน */}
        <FormInput
          label="ชื่อร้าน *"
          value={storeInfo.store_name || ""}
          onChange={(v) => setStoreInfo({ ...storeInfo, store_name: v })}
          required
        />
        <FormInput
          label="บ้านเลขที่"
          value={storeInfo.store_number_address || ""}
          onChange={(v) => setStoreInfo({ ...storeInfo, store_number_address: v })}
        />
        <FormInput
          label="หมู่ที่"
          value={storeInfo.store_number_moo || ""}
          onChange={(v) => setStoreInfo({ ...storeInfo, store_number_moo: v })}
        />

        {/* Province Dropdown */}
        <ProvinceDropdown storeInfo={storeInfo} setStoreInfo={setStoreInfo} userRoute={userRoute} />

        {/* Upload รูปร้าน */}
        <FormUpload
          label={storeInfo.photo_store ? "รูปร้านค้า" : "ถ่ายรูปร้านค้า"}
          value={storeInfo.photo_store}
          onChange={handleImage}
          onRemove={handleRemoveImage}
          inputRef={fileInputRef}
          error={photoError}
        />

        {storeInfo.photo_store && (
          <>
            {/* ช่องนี้ถูกซ่อน (แต่ค่าถูกเก็บ auto) */}
            {/* <FormInput
              label="ที่ตั้งร้าน/รายละเอียดสถานที่"
              value={storeInfo.location_address}
              onChange={v => setStoreInfo({ ...storeInfo, location_address: v })}
              readOnly
            /> */}
            <div className="flex gap-2">
              <FormInput
                label="Latitude"
                type="number"
                value={storeInfo.lat}
                readOnly
              />
              <FormInput
                label="Longitude"
                type="number"
                value={storeInfo.lng}
                readOnly
              />
            </div>
            {geoLoading && <div className="text-blue-500 text-sm animate-pulse">กำลังดึงตำแหน่ง...</div>}
            {geoError && <div className="text-xs text-red-500 mt-2">{geoError}</div>}
          </>
        )}

        {/* ลักษณะร้าน */}
        <ShopSizeSelect value={storeInfo.shop_size} onChange={(v) => setStoreInfo({ ...storeInfo, shop_size: v })} />

        {/* ประเภทร้าน */}
        <div>
          <div className="text-base font-semibold mb-1 text-[#0094E5]">ประเภทร้านค้า</div>
          <div className="flex flex-row gap-2 flex-wrap">
            {SPECIAL_TYPE.map((opt) => {
              const checked = storeInfo.special_type?.includes(opt.value) || false;
              return (
                <label
                  key={opt.value}
                  className={`px-4 py-1.5 rounded-xl border cursor-pointer ${
                    checked
                      ? "bg-[#FF9100]/10 border-[#FF9100] text-[#FF9100]"
                      : "bg-white border-gray-200 text-[#444]"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={checked}
                    onChange={handleSpecialType}
                    className="hidden"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* สถานะสินค้า */}
        <div>
          <div className="font-semibold mb-2 text-[#0094E5]">สถานะสินค้า</div>
          <FormSelectShadcn
            label="Status FMFR"
            value={storeInfo.statusFMFR || ""}
            onChange={(v) => setStoreInfo({ ...storeInfo, statusFMFR: v })}
            options={PRODUCT_STATUS_OPTIONS}
          />
          <FormSelectShadcn
            label="Status OMG"
            value={storeInfo.statusOMG || ""}
            onChange={(v) => setStoreInfo({ ...storeInfo, statusOMG: v })}
            options={PRODUCT_STATUS_OPTIONS}
          />
        </div>

        {/* เหตุผล */}
        <div>
          <div className="font-semibold mb-1">เหตุผลที่ไม่อนุญาต *</div>
          <div className="flex flex-col gap-2">
            {REASONS.map((opt) => (
              <label
                key={opt.value}
                className={`px-4 py-2 rounded-lg border cursor-pointer ${
                  storeInfo.permission_reason === opt.value
                    ? "bg-[#FF9100]/15 border-[#FF9100] text-[#FF9100]"
                    : "bg-white border-gray-200 text-[#21295c]"
                }`}
              >
                <input
                  type="radio"
                  name="permission_reason"
                  value={opt.value}
                  checked={storeInfo.permission_reason === opt.value}
                  onChange={() => setStoreInfo({ ...storeInfo, permission_reason: opt.value })}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <button
          type="submit"
          disabled={isSaveDisabled}
          className={`w-full py-3 rounded-xl font-bold text-lg mt-2 ${
            isSaveDisabled ? "bg-gray-200 text-gray-400" : "bg-[#0094E5] text-white"
          }`}
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}

/* ========== Components ========== */
function FormInput({ label, value, onChange, type = "text", required, readOnly }) {
  return (
    <div>
      <label className="block text-base mb-1 font-semibold text-[#1a355e]">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-[#dde8f5] px-3 py-2 text-[16px] bg-[#f7fbff] font-medium"
        required={required}
        readOnly={readOnly}
      />
    </div>
  );
}

function FormUpload({ label, value, onChange, onRemove, inputRef, error }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-base font-semibold mb-2">{label}</div>
      {!value && (
        <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dde8f5] bg-[#f7fbff] cursor-pointer hover:bg-[#f0f7fd] transition relative">
          <Camera color="#FF9100" size={64} />
          <input
            type="file"
            accept="image/jpeg"
            capture="environment"
            onChange={onChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            ref={inputRef}
          />
        </label>
      )}
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
      {value && (
        <div className="relative w-80 max-w-[95vw] h-80 max-h-[60vw] mb-2">
          <img
            src={typeof value === "string" ? value : URL.createObjectURL(value)}
            alt={label}
            className="w-full h-full object-cover rounded-2xl shadow-md border"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="ลบรูป"
            className="absolute top-2 right-2 bg-white rounded-full p-2 border border-red-300"
          >
            <X color="#f43f5e" size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function ProvinceDropdown({ storeInfo, setStoreInfo, userRoute }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/servey/get/provice")
      .then((res) => res.json())
      .then((data) => {
        const filtered = userRoute ? data.filter((p) => (p.Route || p.route) === userRoute) : data;
        const provincesObj = {};
        filtered.forEach(({ province, district, sub_district, postcode }) => {
          if (!provincesObj[province]) provincesObj[province] = {};
          if (!provincesObj[province][district]) provincesObj[province][district] = [];
          provincesObj[province][district].push({ subdistrict: sub_district, postcode });
        });
        const provincesList = Object.entries(provincesObj).map(([province, districtsObj]) => ({
          province,
          districts: Object.entries(districtsObj).map(([district, subs]) => ({ district, subdistricts: subs })),
        }));
        setProvinces(provincesList);
      })
      .finally(() => setLoading(false));
  }, [userRoute]);

  useEffect(() => {
    const foundProvince = provinces.find((p) => p.province === storeInfo.store_province);
    setDistricts(foundProvince?.districts || []);
    if (!storeInfo.store_district) return;
    const foundDistrict = foundProvince?.districts?.find((d) => d.district === storeInfo.store_district);
    setSubdistricts(foundDistrict?.subdistricts || []);
    if (!storeInfo.store_subdistrict) return;
    const foundSub = foundDistrict?.subdistricts?.find((s) => s.subdistrict === storeInfo.store_subdistrict);
    setPostcode(foundSub?.postcode || "");
  }, [provinces, storeInfo]);

  if (loading) return <div className="text-gray-500">กำลังโหลดจังหวัด...</div>;

  return (
    <div className="grid gap-3">
      <FormSelectShadcn
        label="จังหวัด"
        value={storeInfo.store_province || ""}
        onChange={(v) =>
          setStoreInfo((prev) => ({
            ...prev,
            store_province: v,
            store_district: "",
            store_subdistrict: "",
          }))
        }
        options={provinces.map((p) => ({ value: p.province, label: p.province }))}
      />
      <FormSelectShadcn
        label="อำเภอ"
        value={storeInfo.store_district || ""}
        onChange={(v) =>
          setStoreInfo((prev) => ({ ...prev, store_district: v, store_subdistrict: "" }))
        }
        options={districts.map((d) => ({ value: d.district, label: d.district }))}
        disabled={!storeInfo.store_province}
      />
      <FormSelectShadcn
        label="ตำบล"
        value={storeInfo.store_subdistrict || ""}
        onChange={(v) =>
          setStoreInfo((prev) => ({
            ...prev,
            store_subdistrict: v,
            store_postcode: postcode,
          }))
        }
        options={subdistricts.map((s) => ({ value: s.subdistrict, label: s.subdistrict }))}
        disabled={!storeInfo.store_district}
      />
      <FormInput label="รหัสไปรษณีย์" value={postcode} readOnly />
    </div>
  );
}

function FormSelectShadcn({ label, value, onChange, options = [], disabled }) {
  return (
    <div>
      <label className="block text-base font-semibold mb-1">{label}</label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full border rounded-xl px-3 py-2">
          <SelectValue placeholder="เลือก..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ShopSizeSelect({ value, onChange }) {
  const selected = SHOP_SIZE_OPTIONS.find((opt) => opt.value === value);
  return (
    <div>
      <div className="text-base font-bold mb-2 text-[#0094E5]">ลักษณะร้านค้าที่ท่านพบเจอ</div>
      <div className="flex gap-2 flex-wrap mb-2">
        {SHOP_SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`border rounded-lg px-4 py-2 font-semibold text-lg transition ${
              value === opt.value
                ? "border-[#0094E5] bg-[#e5f4fa] text-[#0094E5]"
                : "border-[#cfe5f8] bg-white text-[#1a355e]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-1 mb-2">
          <div className="text-[#0094E5] font-medium mb-1">คุณเลือก: {selected.desc}</div>
          {!!selected.images?.length && (
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
