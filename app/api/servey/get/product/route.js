
// api/servey/get/product/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb"; // <- ตรงนี้ต้อง 'connectMongoDB'
import Product from "../../../../../models/product";

export async function GET() {
    try {
        await connectMongoDB();
        const products = await Product.find({});
        console.log("Fetched Products:", products);
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching Products:", error);
        return NextResponse.json({ message: "Error fetching Products", error }, { status: 500 });
    }
}