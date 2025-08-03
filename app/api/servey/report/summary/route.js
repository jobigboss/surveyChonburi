// 📁 /app/api/servey/report/summary/route.js

import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  const rawData = await Survey.find();

  const summary = {
    shopSizeSummary: {},
    statusSummary: {},
    productSummary: {}
  };

  // เตรียมเก็บรวมทุกเขต
  const allDistricts = {};

  for (const item of rawData) {
    const { store_info, products, statusFMFR, statusOMG } = item;
    const province = store_info.store_province || "ไม่ระบุจังหวัด";
    const district = store_info.store_district || "ไม่ระบุอำเภอ";
    const size = store_info.shop_size || "ไม่ระบุ";

    // === 1. สรุปตามขนาดร้าน ===
    summary.shopSizeSummary[province] ??= {};
    summary.shopSizeSummary[province][district] ??= {};
    summary.shopSizeSummary[province][district][size] ??= 0;
    summary.shopSizeSummary[province][district][size] += 1;

    // === 2. สรุปสถานะ FMFR / OMG ===
    const statusKey = (brand, status) => `${brand}_${status}`;
    summary.statusSummary[province] ??= {};
    summary.statusSummary[province][district] ??= {};
    summary.statusSummary[province][district][statusKey("FMFR", statusFMFR || "ไม่ระบุ")] ??= 0;
    summary.statusSummary[province][district][statusKey("FMFR", statusFMFR || "ไม่ระบุ")] += 1;
    summary.statusSummary[province][district][statusKey("OMG", statusOMG || "ไม่ระบุ")] ??= 0;
    summary.statusSummary[province][district][statusKey("OMG", statusOMG || "ไม่ระบุ")] += 1;

    // === 3. สรุป Distribution + ราคาแต่ละสินค้า ===
    for (const prod of products) {
      const id = prod.product_id || "ไม่ระบุสินค้า";
      summary.productSummary[id] ??= {
        count: 0,
        priceBox: [],
        pricePack: [],
        priceCarton: []
      };

      if (prod.status === "มีขาย") {
        summary.productSummary[id].count += 1;
        if (prod.priceBox) summary.productSummary[id].priceBox.push(prod.priceBox);
        if (prod.pricePack) summary.productSummary[id].pricePack.push(prod.pricePack);
        if (prod.priceCarton) summary.productSummary[id].priceCarton.push(prod.priceCarton);
      }
    }
  }

  return NextResponse.json({ success: true, data: summary });
}
