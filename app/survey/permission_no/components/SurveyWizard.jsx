"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StoreNoPermission from "./Store"; // หรือ "./StoreNoPermission"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SurveyWizardNoPermission() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSurID, setSuccessSurID] = useState("");
  const [userIdSuccess, setUserIdSuccess] = useState("");
  const router = useRouter();

  // Upload image to S3
  const uploadImageToS3 = async (file, surID, type) => {
    const filename = `${surID}_${type}store.jpg`;
    const res = await fetch("/api/servey/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentType: "image/jpeg" }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Presign error");

    const upload = await fetch(json.url, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: file,
    });
    if (!upload.ok) throw new Error("Upload failed");

    return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${json.key}`;
  };

  const handleSave = async (storeInfo) => {
    setLoading(true);
    try {
      // 1. Generate surID
      const genIdRes = await fetch("/api/servey/gen-id/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storeInfo.user_id || "" }),
      });
      const genIdJson = await genIdRes.json();
      const surID = genIdJson.surID;
      if (!surID) throw new Error("ไม่สามารถสร้างรหัสได้");

      // 2. Upload Image if File
      let photoUrl = storeInfo.photo_store;
      if (photoUrl instanceof File) {
        photoUrl = await uploadImageToS3(photoUrl, surID);
      }

      // 3. Prepare Payload (สำคัญ! products ส่งจาก storeInfo)
      const products = Array.isArray(storeInfo.products) ? storeInfo.products : [];
      const payload = {
        surID,
        store_info: {
          ...storeInfo,
          photo_store: photoUrl,
          permission: "ไม่อนุญาต",
        },
        products, // <<<< ส่ง products ไปด้วย
        market_info: {},
        user_id: storeInfo.user_id,
      };

      // 4. Submit API
      const res = await fetch("/api/servey/submit/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setSuccessSurID(surID);
        setUserIdSuccess(storeInfo.user_id);
        setShowSuccess(true);
      } else {
        alert("เกิดข้อผิดพลาด: " + json.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
    setLoading(false);
  };

  // ✅ Auto copy surID
  useEffect(() => {
    if (showSuccess && successSurID) {
      navigator.clipboard.writeText(successSurID).catch(() => {});
    }
  }, [showSuccess, successSurID]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/50 text-white flex items-center justify-center z-50">
          กำลังบันทึก...
        </div>
      )}
      <StoreNoPermission onSave={handleSave} />

      {/* ✅ Success Popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3">
          <DialogTitle className="text-2xl text-center mb-1">🎉 บันทึกสำเร็จ</DialogTitle>
          <DialogDescription className="text-center text-lg mb-2">
            รหัสแบบสอบถามของคุณ<br />
            <span className="font-bold text-xl bg-gray-100 px-3 py-1 rounded block mt-2">
              {successSurID}
            </span>
            <span className="text-xs text-green-600 mt-2 block">กดปุ่มด้านล่างเพื่อคัดลอก</span>
          </DialogDescription>
          <DialogFooter className="flex flex-col gap-2 items-center w-full">
            <Button
              className="w-52"
              onClick={() => {
                navigator.clipboard.writeText(successSurID).then(() => {
                  alert("คัดลอกแล้ว!");
                }).catch(() => {
                  alert("กรุณาคัดลอกด้วยตัวเอง");
                });
              }}
            >
              คัดลอกโค้ด
            </Button>
            <Button
              className="w-52"
              onClick={() => {
                router.push(`/survey?user_id=${userIdSuccess}`);
                setShowSuccess(false);
              }}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
