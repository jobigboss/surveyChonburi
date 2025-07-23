"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Step1StoreInfo from "./Store";
import Step2Products from "./Product";
import Step3MarketInfo from "./Marketing";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SurveyWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    store_info: {},
    products: [],
    market_info: {},
    statusFMFR: "",
    statusOMG: "",
    surID: "",
  });

  // เพิ่ม state เก็บ user_id ที่สำเร็จ
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSurID, setSuccessSurID] = useState("");
  const [userIdSuccess, setUserIdSuccess] = useState("");
  const router = useRouter();

  // ฟังก์ชันอัปโหลดรูปภาพขึ้น S3 ผ่าน presigned URL
  const uploadImageToS3 = async (file, surID, type) => {
    const filename = `${surID}_${type}.jpg`;
    const presignRes = await fetch("/api/servey/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentType: "image/jpeg" }),
    });

    const presignData = await presignRes.json();
    if (!presignRes.ok) {
      console.error("[uploadImageToS3] presign error:", presignData.error);
      throw new Error(presignData.error || "Failed to get presigned URL");
    }

    let uploadFile = file;
    if (file.type !== "image/jpeg") {
      uploadFile = await convertFileToJpeg(file);
    }

    const uploadRes = await fetch(presignData.url, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: uploadFile,
    });
    if (!uploadRes.ok) {
      console.error("[uploadImageToS3] upload failed", uploadRes.statusText);
      throw new Error("Upload to S3 failed");
    }

    const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${presignData.key}`;
    console.log("[uploadImageToS3] file url:", url);
    return url;
  };

  // แปลงไฟล์รูปเป็น JPEG Blob
  async function convertFileToJpeg(file) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new window.FileReader();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to convert to JPEG"));
          },
          "image/jpeg",
          0.95
        );
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Step1: เก็บ store_info
  const handleStoreInfoNext = (val) => {
    setData((prev) => ({
      ...prev,
      store_info: val,
    }));
    setStep(2);
  };

  // Step2: เก็บ products + statusFMFR + statusOMG
  const handleProductsNext = (val) => {
    setData((prev) => ({
      ...prev,
      products: val.products || val,
      statusFMFR: val.statusFMFRGlobal,
      statusOMG: val.statusOMGGlobal,
    }));
    setStep(3);
  };

  // Step3: รับ market_info แล้วส่งข้อมูลทั้งหมดขึ้น API
  const submitSurvey = async (marketInfoVal) => {
    const userId = data?.store_info?.user_id || "";

    // 1. Gen surID
    let surID = "";
    try {
      const genIdRes = await fetch("/api/servey/gen-id/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const genIdJson = await genIdRes.json();
      surID = genIdJson.surID;
      if (!surID) {
        alert("ไม่สามารถสร้างรหัสแบบสอบถามได้");
        return;
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างรหัสแบบสอบถาม");
      return;
    }

    // 2. อัปโหลดรูปภาพแต่ละประเภท (ถ้าเป็น File)
    const storeInfo = { ...data.store_info };
    try {
      if (storeInfo.photo_store instanceof File) {
        storeInfo.photo_store = await uploadImageToS3(storeInfo.photo_store, surID, "store");
      }
      if (storeInfo.photo_freezer instanceof File) {
        storeInfo.photo_freezer = await uploadImageToS3(storeInfo.photo_freezer, surID, "freeze");
      }
      if (storeInfo.photo_shelf instanceof File) {
        storeInfo.photo_shelf = await uploadImageToS3(storeInfo.photo_shelf, surID, "shelf");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป: " + err.message);
      return;
    }

    // 3. รวมข้อมูลส่ง API
    const allSurveyData = {
      surID,
      store_info: storeInfo,
      products: data.products,
      market_info: marketInfoVal,
      statusFMFR: data.statusFMFR,
      statusOMG: data.statusOMG,
      user_id: userId,
    };

    // Debug ก่อนส่ง
    console.log("==== ส่งทั้งหมดไป API (allSurveyData) ====");
    console.log(JSON.stringify(allSurveyData, null, 2));

    try {
      const res = await fetch("/api/servey/submit/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allSurveyData),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessSurID(surID);
        setUserIdSuccess(userId);
        setShowSuccess(true);
        setStep(1);
        setData({
          store_info: {},
          products: [],
          market_info: {},
          statusFMFR: "",
          statusOMG: "",
          surID: "",
        });
        // ไม่ต้อง alert หรือ prompt แล้ว
      } else {
        alert("เกิดข้อผิดพลาด: " + json.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  // Blur ด้านหลังตอน showSuccess
  useEffect(() => {
    if (showSuccess) {
      document.body.classList.add("overflow-hidden");
      document.getElementById("survey-blur-bg")?.classList.remove("hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.getElementById("survey-blur-bg")?.classList.add("hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.getElementById("survey-blur-bg")?.classList.add("hidden");
    };
  }, [showSuccess]);

  // copy รหัสให้อัตโนมัติเมื่อ popup โชว์
  useEffect(() => {
    if (showSuccess && successSurID) {
      navigator.clipboard.writeText(successSurID).catch(() => {});
    }
  }, [showSuccess, successSurID]);

  // log state ทุกครั้งที่ render
  // console.log(">>> Current Wizard state (render):", data);

  return (
    <>
      {/* Blur Layer */}
      <div
        id="survey-blur-bg"
        className={`fixed inset-0 z-[49] bg-black/40 backdrop-blur-sm transition-all duration-200 ${showSuccess ? "" : "hidden"}`}
        aria-hidden="true"
      />
      {step === 1 && <Step1StoreInfo data={data.store_info} onNext={handleStoreInfoNext} />}
      {step === 2 && <Step2Products data={data.products} onBack={() => setStep(1)} onNext={handleProductsNext} />}
      {step === 3 && (
        <Step3MarketInfo
          data={data.market_info}
          onBack={() => setStep(2)}
          onSubmit={submitSurvey}
          storeInfo={data.store_info}
          products={Array.isArray(data.products) ? data.products : data.products?.products || []}
          userId={data.store_info?.user_id || ""}
        />
      )}

      {/* === Success Popup Dialog === */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 z-[50]">
          <DialogTitle className="text-2xl text-center mb-1">🎉 ลงทะเบียนสำเร็จ</DialogTitle>
          <DialogDescription className="text-center text-lg mb-2">
            รหัสแบบสอบถามของคุณ<br />
            <span className="font-bold text-xl bg-gray-100 px-3 py-1 rounded block mt-2">{successSurID}</span>
            <span className="text-xs text-green-600 mt-2 block">(คัดลอกอัตโนมัติแล้ว)</span>
          </DialogDescription>
          <DialogFooter className="flex flex-col gap-2 items-center w-full">
            <Button
              className="w-full"
              onClick={() => {
                router.push(`/survey?user_id=${userIdSuccess || "demo"}`);
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
