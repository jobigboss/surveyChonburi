// api/servey/create
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb"; // แก้ path ตามของจริง
import Survey from "../../../../models/survey"; // แก้ path ตามของจริง

export async function POST(req) {
  try {
    await connectMongoDB();
    const { store_info } = await req.json();
    if (!store_info) {
      return NextResponse.json({ error: "store_info is required" }, { status: 400 });
    }
    // Create survey
    const survey = await Survey.create({ ...store_info, user_id: undefined });
    return NextResponse.json({ user_id: survey._id.toString() });
  } catch (err) {
    console.error("API /survey/create error:", err);
    // ส่ง error JSON กลับเสมอ
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}