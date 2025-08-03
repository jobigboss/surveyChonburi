// ✅ 1. รายงานขนาดร้าน
// 📁 /app/api/servey/report/shop-size-summary/route.js

import { connectMongoDB } from "../../../../../../lib/mongodb";
import Survey from "../../../../../../models/survey";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  const result = await Survey.aggregate([
    {
      $group: {
        _id: {
          province: "$store_info.store_province",
          district: "$store_info.store_district",
          size: "$store_info.shop_size"
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {};
  result.forEach(({ _id, count }) => {
    const { province = "ไม่ระบุจังหวัด", district = "ไม่ระบุอำเภอ", size = "ไม่ระบุ" } = _id;
    summary[province] ??= {};
    summary[province][district] ??= {};
    summary[province][district][size] = count;
  });

  return NextResponse.json({ success: true, data: summary });
}

