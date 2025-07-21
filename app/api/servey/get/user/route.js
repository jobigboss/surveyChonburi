// api/servey/get/user/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb"; // <- ตรงนี้ต้อง 'connectMongoDB'
import Username from "../../../../../models/user";

export async function GET() {
    try {
        await connectMongoDB();
        const users = await Username.find({});
        console.log("Fetched users:", users);
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: "Error fetching users", error }, { status: 500 });
    }
}