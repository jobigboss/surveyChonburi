import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import User from "../../../../../models/user";

export async function GET() {
  try {
    await connectMongoDB();

    const reports = await Survey.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "user_id", // String field in Survey
          foreignField: "user_id", // String field in User
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
      }
    ]);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด", error }, { status: 500 });
  }
}
