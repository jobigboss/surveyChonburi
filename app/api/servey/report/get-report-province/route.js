// /api/servey/report/get-report-province/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Province from "../../../../../models/provice";

export async function GET() {
  try {
    await connectMongoDB();

    const result = await Province.aggregate([
      {
        $match: {
          $or: [
            { Route: { $exists: true, $ne: null } },
            { route: { $exists: true, $ne: null } },
          ]
        }
      },
      {
        $addFields: {
          zone: { $ifNull: ["$Route", "$route"] }
        }
      },
      {
        $group: {
          _id: {
            province: "$province",
            district: "$district",
            zone: "$zone"
          }
        }
      },
      {
        $group: {
          _id: "$_id.province",
          districts: {
            $push: {
              name: "$_id.district",
              zone: "$_id.zone"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          districts: 1
        }
      },
      { $sort: { province: 1 } }
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching province data:", error);
    return NextResponse.json(
      { message: "Error fetching province data", error },
      { status: 500 }
    );
  }
}
