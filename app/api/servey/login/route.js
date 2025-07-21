// api/servey/login
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { user_id, user_password } = await req.json();
    // หา user จาก user_id
    const user = await User.findOne({ user_id });
    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" });
    }
    // ตรวจรหัสผ่าน (hash)
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
    }
    // สำเร็จ
    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        role: user.role,
        // อื่นๆ เช่น first_name, last_name ถ้าอยากส่ง
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message }, { status: 500 });
  }
}

