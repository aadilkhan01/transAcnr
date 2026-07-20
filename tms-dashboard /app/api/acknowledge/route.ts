import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const run_id = searchParams.get("run_id");

    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("acknowledgments");

    const filter = run_id ? { run_id } : {};
    const docs = await col.find(filter).sort({ acknowledged_at: -1 }).toArray();

    return NextResponse.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to fetch acknowledgments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run_id, target, notes } = body;

    if (!run_id || !target) {
      return NextResponse.json({ error: "run_id and target are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("acknowledgments");

    const doc = {
      run_id,
      target,
      notes: notes || "",
      acknowledged_at: new Date().toISOString(),
    };

    const result = await col.insertOne(doc);
    return NextResponse.json({ _id: result.insertedId.toString(), ...doc, success: true });
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to save acknowledgment" }, { status: 500 });
  }
}
