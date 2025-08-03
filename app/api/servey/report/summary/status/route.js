// ✅ 2. รายงานสถานะสินค้า FMFR / OMG
// 📁 /app/api/servey/report/status-summary/route.js

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
          statusFMFR: "$statusFMFR",
          statusOMG: "$statusOMG"
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {};

  result.forEach(({ _id, count }) => {
    const {
      province = "ไม่ระบุจังหวัด",
      district = "ไม่ระบุอำเภอ",
      statusFMFR = "ไม่ระบุ",
      statusOMG = "ไม่ระบุ"
    } = _id;

    summary[province] ??= {};
    summary[province][district] ??= {};

    const fmfrKey = `FMFR_${statusFMFR}`;
    const omgKey = `OMG_${statusOMG}`;

    summary[province][district][fmfrKey] = (summary[province][district][fmfrKey] || 0) + count;
    summary[province][district][omgKey] = (summary[province][district][omgKey] || 0) + count;
  });

  return NextResponse.json({ success: true, data: summary });
}