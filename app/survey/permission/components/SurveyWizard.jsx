"use client";
import { useState } from "react";
import Step1StoreInfo from "./Store";
import Step2Products from "./Product";
import Step3MarketInfo from "./Marketing";

export default function SurveyWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    store_info: {},
    products: [],
    market_info: {}
  });

  // รวมข้อมูลแต่ละ step
  const handleUpdate = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // ส่งข้อมูลไป backend
  const handleSubmit = async () => {
    const res = await fetch("/api/survey/create", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    // handle response ...
    if (res.ok) alert("ส่งแบบสอบถามเรียบร้อย!");
  };

  return (
    <div>
      {step === 1 && (
        <Step1StoreInfo
          data={data.store_info}
          onNext={(val) => {
            handleUpdate("store_info", val);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2Products
          data={data.products}
          onBack={() => setStep(1)}
          onNext={(val) => {
            handleUpdate("products", val);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <Step3MarketInfo
          data={data.market_info}
          onBack={() => setStep(2)}
          onSubmit={(val) => {
            handleUpdate("market_info", val);
            handleSubmit();
          }}
        />
      )}
    </div>
  );
}
