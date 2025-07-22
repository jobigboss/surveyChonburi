// api/servey/get/route

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    try {
        await connectMongoDB();
        if (!user_id) {
            return NextResponse.json({ message: "Missing user_id" }, { status: 400 });
        }
        const user = await Username.findOne({ user_id });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ route: user.route || [] });
    } catch (error) {
        return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
}