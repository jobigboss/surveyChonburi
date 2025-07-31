"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReportPage from "./components/reportPage";
import Contact from "./components/Contact";

const tabs = [
  { key: "performance", label: "Performance" },
  { key: "product", label: "สินค้า" },
  { key: "contact", label: "ผู้ติดต่อ" },
];

export default function ReportTabs() {
  const [activeTab, setActiveTab] = React.useState("performance");
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-2">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white flex-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={
                "relative min-w-[110px] px-8 py-4 text-[1.17rem] font-semibold tracking-wide transition-all " +
                (activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-500")
              }
              style={{ outline: "none" }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span
                className={
                  "absolute left-4 right-4 bottom-0 h-1 rounded-full transition-all duration-300 " +
                  (activeTab === tab.key ? "bg-blue-600" : "bg-transparent")
                }
              />
            </button>
          ))}
        </div>
        {/* กลับเมนูหลัก */}
        <button
          onClick={() => router.push("/admin")}
          className="ml-6 flex-shrink-0 flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg px-4 py-2 font-medium transition shadow-sm focus-visible:ring focus-visible:ring-blue-200"
        >
          <ArrowLeft size={18} className="mr-2" />
          กลับเมนูหลัก
        </button>
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === "performance" && (
          <div>
            <ReportPage />
          </div>
        )}
        {activeTab === "product" && (
          <div>
            <div className="text-2xl font-bold mb-5 text-blue-800">สินค้า</div>
            <ul className="divide-y rounded-xl overflow-hidden border border-gray-100 bg-white">
              <li className="py-4 px-6 flex justify-between items-center">
                <span className="font-medium">Pepsi</span>
                <span className="text-gray-500">20 ชิ้น</span>
              </li>
              <li className="py-4 px-6 flex justify-between items-center">
                <span className="font-medium">Coke</span>
                <span className="text-gray-500">18 ชิ้น</span>
              </li>
              <li className="py-4 px-6 flex justify-between items-center">
                <span className="font-medium">Sprite</span>
                <span className="text-gray-500">10 ชิ้น</span>
              </li>
            </ul>
          </div>
        )}
        {activeTab === "contact" && (
          <div>
            <Contact/>
          
          </div>
        )}
      </div>
    </div>
  );
}
