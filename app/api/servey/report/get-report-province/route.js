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
          _id: { zone: "$zone", province: "$province" },
          districts: { $addToSet: "$district" }
        }
      },
      {
        $group: {
          _id: "$_id.zone",
          provinces: {
            $push: {
              province: "$_id.province",
              districts: "$districts"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          zone: "$_id",
          provinces: 1
        }
      },
      { $sort: { zone: 1 } }
    ]);

    return NextResponse.json(result); // ✅ return เป็น array
  } catch (error) {
    console.error("Error fetching province grouping:", error);
    return NextResponse.json(
      { message: "Error fetching province data", error },
      { status: 500 }
    );
  }
}
