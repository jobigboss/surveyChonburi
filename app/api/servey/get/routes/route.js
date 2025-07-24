// api/servey/get/routes/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Area from "../../../../../models/provice";

export async function GET() {
  try {
    await connectMongoDB();
    // ดึง Route ที่ไม่ซ้ำและไม่ว่าง
    const routes = await Area.find({}, "Route").lean();
    const uniqueRoutes = [...new Set(routes.map(r => r.Route).filter(Boolean))];

    return NextResponse.json({ success: true, routes: uniqueRoutes });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
