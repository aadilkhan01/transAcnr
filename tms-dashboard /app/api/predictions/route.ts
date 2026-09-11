import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("predictions");

    const latest = await col
      .find({})
      .sort({ inference_timestamp: -1 })
      .limit(1)
      .toArray();

    if (!latest.length) {
      return NextResponse.json({ error: "No predictions found" }, { status: 404 });
    }

    const doc = latest[0];
    // Convert ObjectId to string
    return NextResponse.json({ ...doc, _id: doc._id.toString() });
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 });
  }
}
