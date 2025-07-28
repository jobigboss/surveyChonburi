import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import User from "../../../../../models/user";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ success: false, message: "ต้องระบุ user_id" }, { status: 400 });
    }

    const reports = await Survey.aggregate([
      { $match: { user_id: user_id } }, // ✅ กรองตาม user_id
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "user_id",
          as: "userInfo"
        }
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          store_info: 1,
          products: 1,
          market_info: 1,
          createdAt: 1,
          user_id: 1,
          user_first_name: "$userInfo.user_first_name",
          user_last_name: "$userInfo.user_last_name",
          role: "$userInfo.role"
        }
      }
    ]);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด", error }, { status: 500 });
  }
}
