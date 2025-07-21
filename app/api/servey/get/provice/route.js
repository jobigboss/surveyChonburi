// api/servey/get/provice/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb"; // <- ตรงนี้ต้อง 'connectMongoDB'
import Province from "../../../../../models/provice";

export async function GET() {
    try {
        await connectMongoDB(); // <- ตรงนี้ต้อง connectMongoDB
        const province = await Province.find({});
        console.log("Fetched province:", province);
        return NextResponse.json(province);
    } catch (error) {
        console.error("Error fetching province:", error);
        return NextResponse.json({ message: "Error fetching province", error }, { status: 500 });
    }
}