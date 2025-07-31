// / api/servey/report/contact
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";


export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const startDate = searchParams.get("startDate"); // yyyy-mm-dd
    const endDate = searchParams.get("endDate");     // yyyy-mm-dd

    // NEW: ถ้ามี all=1 ใน query, ให้ export ข้อมูลทั้งหมด (ไม่แบ่งหน้า)
    const exportAll = searchParams.get("all") === "1";

    // เงื่อนไข query
    const query = {
      "market_info.demand": "buy"
    };

    // Search ร้านค้า
    if (search) {
      query["store_info.store_name"] = { $regex: search, $options: "i" };
    }

    // Filter ช่วงวันที่ (ถ้ามี)
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate + "T00:00:00.000Z"),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const total = await Survey.countDocuments(query);

    // ถ้า export ทั้งหมด (all=1) → ไม่ skip, ไม่ limit (แต่ควรใส่ max limit กัน crash)
    let docs;
    if (exportAll) {
      docs = await Survey.find(query)
        .sort({ createdAt: -1 })
        .limit(20000) // กัน data เยอะเกินไป, ปรับเพิ่ม/ลดได้
        .lean();
    } else {
      docs = await Survey.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const data = docs.map(d => ({
      createdAt: d.createdAt,
      surID: d.surID,
      store_name: d.store_info?.store_name || "",
      contact: d.market_info?.contact || "",
      phone: d.market_info?.phone || "",
      address: [
        d.store_info?.store_name,
        d.store_info?.store_subdistrict,
        d.store_info?.store_district,
        d.store_info?.store_province,
        d.store_info?.store_postcode
        ].filter(Boolean).join(" "),
      lat: d.store_info?.location?.lat,
      lng: d.store_info?.location?.lng,
      interest_products: d.market_info?.interest_products || [],
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}