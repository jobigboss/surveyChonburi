// api/servey/editUser/get-user/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Username from "../../../../../models/user";

export async function GET() {
  try {
    await connectMongoDB();
    const users = await Username.find({});
    console.log("Fetched users:", users);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching users", error },
      { status: 500 }
    );
  }
}
