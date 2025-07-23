
// api/servey/submit/survey
import { connectMongoDB } from "../../../../../lib/mongodb";
import Survey from "../../../../../models/survey";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const data = await req.json();
  try {
    console.log("==== DATA RECEIVED ====");
    console.dir(data, { depth: 10 });
    const doc = await Survey.create(data);
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    // สำคัญ!
    console.log("==== CREATE ERROR ====");
    console.error(err); // << ตรงนี้จะ print error ที่ terminal
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
  }
}