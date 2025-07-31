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

    // เงื่อนไข query
    const query = {
      "market_info.demand": "buy"   // <<---- เฉพาะร้านที่ demand = "buy"
    };

    if (search) {
      query["store_info.store_name"] = { $regex: search, $options: "i" };
    }

    const total = await Survey.countDocuments(query);

    const docs = await Survey.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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
      ].filter(Boolean).join(", "),
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
