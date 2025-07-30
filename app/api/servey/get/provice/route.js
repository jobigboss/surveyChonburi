// /api/servey/get/provice/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Province from "../../../../../models/provice";

export async function GET() {
  try {
    await connectMongoDB();

    // ดึงเฉพาะ document ที่มี Route หรือ route
    const filteredProvince = await Province.find({
      $or: [
        { Route: { $exists: true, $ne: null } },
        { route: { $exists: true, $ne: null } }
      ]
    });

    return NextResponse.json(filteredProvince);
  } catch (error) {
    console.error("Error fetching province:", error);
    return NextResponse.json(
      { message: "Error fetching province", error },
      { status: 500 }
    );
  }
}
