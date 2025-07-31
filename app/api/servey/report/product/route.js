// / api/servey/report/product
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";

export async function GET() {
  await connectMongoDB();

  const summary = await Survey.aggregate([
    // 1. Unwind FMFR
    {
      $project: {
        province: "$store_info.store_province",
        amphur: "$store_info.store_amphur",
        district: "$store_info.store_district",
        product: { $literal: "FMFR" },
        status: "$statusFMFR",
      },
    },
    // 2. Union with OMG
    {
      $unionWith: {
        coll: "surveys", // ชื่อ collection ที่แท้จริง ถ้าไม่ใช่ "surveys" เปลี่ยนให้ตรง
        pipeline: [
          {
            $project: {
              province: "$store_info.store_province",
              amphur: "$store_info.store_amphur",
              district: "$store_info.store_district",
              product: { $literal: "OMG" },
              status: "$statusOMG",
            },
          },
        ],
      },
    },
    // 3. Group by province/amphur/district/product/status
    {
      $group: {
        _id: {
          province: "$province",
          amphur: "$amphur",
          district: "$district",
          product: "$product",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    // 4. Group by province/amphur/district
    {
      $group: {
        _id: {
          province: "$_id.province",
          amphur: "$_id.amphur",
          district: "$_id.district",
        },
        products: {
          $push: {
            product: "$_id.product",
            status: "$_id.status",
            count: "$count",
          },
        },
      },
    },
    // 5. Reshape products: { FMFR: {...}, OMG: {...} }
    {
      $addFields: {
        products: {
          $arrayToObject: {
            $map: {
              input: ["FMFR", "OMG"],
              as: "p",
              in: [
                "$$p",
                {
                  available: {
                    $let: {
                      vars: {
                        found: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$products",
                                as: "prod",
                                cond: {
                                  $and: [
                                    { $eq: ["$$prod.product", "$$p"] },
                                    { $eq: ["$$prod.status", "available"] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$found.count", 0] },
                    },
                  },
                  out_of_stock: {
                    $let: {
                      vars: {
                        found: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$products",
                                as: "prod",
                                cond: {
                                  $and: [
                                    { $eq: ["$$prod.product", "$$p"] },
                                    { $eq: ["$$prod.status", "out_of_stock"] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$found.count", 0] },
                    },
                  },
                  discontinued: {
                    $let: {
                      vars: {
                        found: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$products",
                                as: "prod",
                                cond: {
                                  $and: [
                                    { $eq: ["$$prod.product", "$$p"] },
                                    { $eq: ["$$prod.status", "discontinued"] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$found.count", 0] },
                    },
                  },
                  never_sold: {
                    $let: {
                      vars: {
                        found: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$products",
                                as: "prod",
                                cond: {
                                  $and: [
                                    { $eq: ["$$prod.product", "$$p"] },
                                    { $eq: ["$$prod.status", "never_sold"] },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$found.count", 0] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    // 6. Group districts by amphur
    {
      $group: {
        _id: {
          province: "$_id.province",
          amphur: "$_id.amphur",
        },
        districts: {
          $push: {
            name: "$_id.district",
            products: "$products",
          },
        },
      },
    },
    // 7. Group amphur by province
    {
      $group: {
        _id: "$_id.province",
        amphurs: {
          $push: {
            name: "$_id.amphur",
            districts: "$districts",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        province: "$_id",
        amphurs: 1,
      },
    },
    { $sort: { province: 1 } },
  ]);

  return NextResponse.json({ data: summary });
}
