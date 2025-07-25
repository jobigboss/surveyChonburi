// api/servey/get/user/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb"; // <- ตรงนี้ต้อง 'connectMongoDB'
import Username from "../../../../../models/user";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get("user_id");

        if (!user_id) {
            return NextResponse.json({ message: "Missing user_id" }, { status: 400 });
        }

        await connectMongoDB();
        const user = await Username.find({ user_id }); // ค้นหาเฉพาะ user_id
        console.log("Fetched user by user_id:", user);

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Error fetching user", error }, { status: 500 });
    }
}