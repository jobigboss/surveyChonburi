import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import User from "../../../../../models/user";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // นับจำนวนทั้งหมดก่อน
    const total = await Survey.countDocuments();

    // Query ด้วย aggregation + pagination
    const reports = await Survey.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "user_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true
        }
      },
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
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    return NextResponse.json({
      success: true,
      reports,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด", error },
      { status: 500 }
    );
  }
}
