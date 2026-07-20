import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("notifications");

    await col.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { dismissed: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to dismiss notification" }, { status: 500 });
  }
}
