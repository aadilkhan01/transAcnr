import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("predictions");

    const docs = await col
      .find({})
      .sort({ inference_timestamp: -1 })
      .limit(limit)
      .toArray();

    const results = docs.map((d) => ({
      ...d,
      _id: d._id.toString(),
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
