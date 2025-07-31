// /api/servey/report/get-report.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("user_id");

    // === Filter Matching ===
    const match = {};
    if (userId) match.user_id = userId;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59);
        match.createdAt.$lte = e;
      }
    }

    // === Total for pagination ===
    const total = await Survey.countDocuments(match);

    // === Aggregate with filter + pagination ===
    const reports = await Survey.aggregate([
      { $match: match },
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
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
