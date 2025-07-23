// api/servey/gen-id/survey
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();

  const { user_id } = await req.json();
  console.log("== [gen-id] user_id:", user_id);

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  // --- บวก +7 ชั่วโมง สำหรับ timezone ไทย ---
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `${user_id}-${year}${month}${day}`;
  console.log("== [gen-id] prefix:", prefix);

  const latest = await Survey.findOne({ surID: { $regex: `^${prefix}` } })
    .sort({ surID: -1 })
    .lean();

  let runNo = 1;
  if (latest && latest.surID) {
    const match = latest.surID.match(/(\d{3})$/);
    if (match) runNo = parseInt(match[1], 10) + 1;
  }
  const surID = `${prefix}${String(runNo).padStart(3, "0")}`;
  console.log("== [gen-id] RETURN surID:", surID);

  return NextResponse.json({ surID });
}