// ✅ 3. รายงานสินค้าที่มีขาย + ราคา (เรียงตามลำดับใน collection product)
// 📁 /app/api/servey/report/summary/product/route.js

import { connectMongoDB } from "../../../../../../lib/mongodb";
import { NextResponse } from "next/server";
import Survey from "../../../../../../models/survey";
import Product from "../../../../../../models/product";

export async function GET() {
  await connectMongoDB();

  // 1️⃣ ดึงข้อมูลจาก survey
  const surveySummary = await Survey.aggregate([
    { $unwind: "$products" },
    { $match: { "products.status": "มีขาย" } },
    {
      $group: {
        _id: "$products.product_id",
        count: { $sum: 1 },
        priceBox: { $push: "$products.priceBox" },
        pricePack: { $push: "$products.pricePack" },
        priceCarton: { $push: "$products.priceCarton" }
      }
    }
  ]);

  // 2️⃣ ดึงข้อมูลสินค้าจาก collection product ตามลำดับ
  const productDocs = await Product.find({ fmProID: { $in: surveySummary.map(d => d._id) } }).lean();

  const productMap = {};
  productDocs.forEach(p => {
    productMap[p.fmProID] = p.fmProName;
  });

  // 3️⃣ เรียงตามลำดับสินค้าใน collection product
  const summary = productDocs.map(prod => {
    const match = surveySummary.find(d => d._id === prod.fmProID);
    return {
      id: prod.fmProID,
      name: prod.fmProName,
      count: match?.count || 0,
      priceBox: match?.priceBox?.filter(v => typeof v === 'number') || [],
      pricePack: match?.pricePack?.filter(v => typeof v === 'number') || [],
      priceCarton: match?.priceCarton?.filter(v => typeof v === 'number') || []
    };
  });

  return NextResponse.json({ success: true, data: summary });
}