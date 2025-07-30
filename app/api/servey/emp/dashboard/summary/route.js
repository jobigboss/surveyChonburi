//  api/servey/emp/dashboard/summary
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Survey from "../../../../../../models/survey";
import { NextResponse } from "next/server";

// Utils แปลง date/time ให้ฝั่ง React
function toOnlyTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
function toThaiDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const matchStage = user_id ? { $match: { user_id } } : { $match: {} };

    const pipeline = [
      matchStage,
      {
        $addFields: {
          surveyDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+07:00"
            }
          }
        }
      },
      // Group by district + date
      {
        $group: {
          _id: {
            district: "$store_info.store_district",
            surveyDate: "$surveyDate"
          },
          totalStores: { $sum: 1 },
          allow: {
            $sum: { $cond: [{ $eq: ["$store_info.permission", "อนุญาต"] }, 1, 0] }
          },
          deny: {
            $sum: { $cond: [{ $eq: ["$store_info.permission", "ไม่อนุญาต"] }, 1, 0] }
          },
          fmfr: {
            $sum: { $cond: [{ $in: ["$statusFMFR", ["มีขาย", "สินค้าหมด"]] }, 1, 0] }
          },
          neverFMFR: {
            $sum: { $cond: [{ $eq: ["$statusFMFR", "ไม่เคยขาย"] }, 1, 0] }
          },
          stopFMFR: {
            $sum: { $cond: [{ $eq: ["$statusFMFR", "เลิกขาย"] }, 1, 0] }
          },
          kids: {
            $sum: { $cond: [{ $in: ["$statusOMG", ["มีขาย", "สินค้าหมด"]] }, 1, 0] }
          },
          stores: {
            $push: {
              surID: "$surID",
              store_name: "$store_info.store_name",
              permission: "$store_info.permission",
              statusFMFR: "$statusFMFR",
              statusOMG: "$statusOMG",
              createdAt: "$createdAt",
              photo_store: "$store_info.photo_store",
              photo_freezer: "$store_info.photo_freezer",
              photo_shelf: "$store_info.photo_shelf",
            }
          }
        }
      },
      // Group by district (เก็บวันและร้านใน district)
      {
        $group: {
          _id: "$_id.district",
          days: {
            $push: {
              surveyDate: "$_id.surveyDate",
              totalStores: "$totalStores",
              allow: "$allow",
              deny: "$deny",
              fmfr: "$fmfr",
              neverFMFR: "$neverFMFR",
              stopFMFR: "$stopFMFR",
              kids: "$kids",
              stores: "$stores"
            }
          }
        }
      },
      // sort district (A-Z) และวันในแต่ละเขต (ล่าสุดก่อน)
      { $sort: { "_id": 1 } }
    ];

    let result = await Survey.aggregate(pipeline);

    // sort days (ใหม่-เก่า) และเพิ่ม format date/time
    result = result.map(zone => ({
      ...zone,
      days: zone.days
        .sort((a, b) => new Date(b.surveyDate) - new Date(a.surveyDate))
        .map(day => ({
          ...day,
          thaiDate: toThaiDate(day.stores.length ? day.stores[0].createdAt : day.surveyDate),
          stores: day.stores
            .map(store => ({
              ...store,
              onlyTime: toOnlyTime(store.createdAt),
              createdAt: store.createdAt,
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }))
    }));

    return NextResponse.json(result ?? []);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json([], { status: 500 });
  }
}