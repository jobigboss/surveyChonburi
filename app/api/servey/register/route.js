import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Register from "../../../../models/user";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const { user_id, user_password, user_first_name, user_last_name, user_tel, role, route } = body;

    // ✅ ตรวจสอบข้อมูล
    if (!user_id || !user_password || !user_first_name || !user_last_name) {
      return NextResponse.json({ success: false, message: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่ามี user_id ซ้ำหรือไม่
    const exist = await Register.findOne({ user_id });
    if (exist) {
      return NextResponse.json({ success: false, message: "User ID นี้ถูกใช้แล้ว" }, { status: 409 });
    }

    // ✅ สร้าง user ใหม่
    const newUser = await Register.create({
      user_id,
      user_password,
      user_first_name,
      user_last_name,
      user_tel,
      role,
      route: role === "member" ? route : null, // ✅ บันทึกเฉพาะ member
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
