import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import Username from "../../../../../models/user"; //

export async function GET(req) {
  try {
    await connectMongoDB();

    // ✅ ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ dropdown)
    const userList = await Username.aggregate([
      {
        $match: { role: "member" } // ✅ กรองเฉพาะ role
      },
      {
        $project: {
          _id: 0,
          user_id: 1,
          user_tel: 1,
          route: 1,
          full_name: {
            $concat: ["$user_first_name", " ", "$user_last_name"] // ✅ รวมชื่อ
          }
        }
      }
    ]);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("user_id");
    const province = searchParams.get("province");
    const district = searchParams.get("district");

    // === Filter Matching ===
    const match = {};
    if (userId) match.user_id = userId;
    if (province) match["store_info.store_province"] = province;
    if (district) match["store_info.store_district"] = district;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59);
        match.createdAt.$lte = e;
      }
    }

    // === Pipeline to group by day ===
    const groupPipeline = [
      { $match: match },
      {
        $addFields: {
          surveyDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        // 👉 Group by วัน และ user เพื่อแยกรายชื่อคนคีย์ในแต่ละวัน
        $group: {
          _id: {
            date: "$surveyDate",
            user_id: "$user_id",
          },
          count: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$store_info.permission", "อนุญาต"] }, 1, 0],
            },
          },
          notApproved: {
            $sum: {
              $cond: [{ $eq: ["$store_info.permission", "ไม่อนุญาต"] }, 1, 0],
            },
          },
          items: {
            $push: {
              _id: "$_id",
              surID: "$surID",
              store_info: "$store_info",
              market_info: {
                reason: "$market_info.reason",
                demand: "$market_info.demand"},
              statusFMFR:"$statusFMFR",
              statusOMG:"$statusOMG",
              user_id: "$user_id",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        // 👉 Group by วันอีกครั้ง เพื่อรวมเป็น userSummary[]
        $group: {
          _id: "$_id.date",
          total: { $sum: "$count" },
          approved: { $sum: "$approved" },
          notApproved: { $sum: "$notApproved" },
          userSummary: {
            $push: {
              user_id: "$_id.user_id",
              count: "$count",
              approved: "$approved",
              notApproved: "$notApproved",
            },
          },
          items: {
            $push: "$items",
          },
        },
      },
      {
        // 👉 Flatten items array
        $addFields: {
          items: {
            $reduce: {
              input: "$items",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // === For total pages (real total days) ===
    const totalDays = await Survey.aggregate([
      { $match: match },
      {
        $addFields: {
          surveyDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $group: {
          _id: "$surveyDate",
        },
      },
      { $count: "count" },
    ]);

    const total = totalDays[0]?.count || 0;

    // === Final Grouped Report ===
    const reports = await Survey.aggregate(groupPipeline);

    return NextResponse.json({
      success: true,
      reports,
      total, // จำนวนวันทั้งหมด
      page,
      limit,
      users: userList,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
