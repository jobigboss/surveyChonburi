// /api/servey/editUser/update-user/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Username from "../../../../../models/user";

export async function PUT(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { _id, user_first_name, user_last_name, user_tel, role, route } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "ไม่พบ ID ผู้ใช้" }, { status: 400 });
    }

    // สร้าง object เฉพาะฟิลด์ที่จะอัปเดต
    const updateData = {
      user_first_name,
      user_last_name,
      user_tel,
      role,
      route: role === "member" ? route : null // ถ้าไม่ใช่ member ให้เคลียร์ route
    };

    const updatedUser = await Username.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอัปเดต", error },
      { status: 500 }
    );
  }
}
