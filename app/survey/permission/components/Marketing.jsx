import { useState } from "react";

export default function Step3MarketInfo({ data, onBack, onSubmit }) {
  const [marketInfo, setMarketInfo] = useState(data || {});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(marketInfo);
      }}
      className="max-w-md mx-auto py-8"
    >
      <h2 className="font-bold mb-4">ข้อมูลการตลาด</h2>
      <input
        name="reason"
        placeholder="เหตุผลทางการตลาด"
        value={marketInfo.reason || ""}
        onChange={(e) => setMarketInfo({ ...marketInfo, reason: e.target.value })}
        className="input mb-3"
        required
      />
      {/* เพิ่ม field อื่น ๆ */}
      <div className="flex justify-between mt-4">
        <button type="button" className="btn" onClick={onBack}>
          ย้อนกลับ
        </button>
        <button type="submit" className="btn btn-success">
          ส่งข้อมูล
        </button>
      </div>
    </form>
  );
}
