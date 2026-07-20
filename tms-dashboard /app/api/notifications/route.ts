import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("transACNR");
    const col = db.collection("notifications");

    const docs = await col
      .find({ dismissed: false })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(docs.map((d) => ({ ...d, _id: d._id.toString() })));
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// Sync notifications from latest predictions (called after each fetch)
export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("transACNR");
    const predCol = db.collection("predictions");
    const notifCol = db.collection("notifications");

    const latest = await predCol
      .find({})
      .sort({ inference_timestamp: -1 })
      .limit(1)
      .toArray();

    if (!latest.length) return NextResponse.json({ synced: 0 });

    const pred = latest[0];
    const targets = ["compressor_failure", "pump_failure", "cooling_degradation"] as const;
    let synced = 0;

    for (const target of targets) {
      const p = pred.predictions?.[target];
      if (!p?.triggered) continue;

      const existing = await notifCol.findOne({ run_id: pred.run_id, target });
      if (existing) continue;

      await notifCol.insertOne({
        run_id: pred.run_id,
        target,
        risk_level: p.risk_level,
        message: p.recommendation,
        created_at: pred.inference_timestamp,
        dismissed: false,
      });
      synced++;
    }

    return NextResponse.json({ synced });
  } catch (err) {
    console.error("MongoDB error:", err);
    return NextResponse.json({ error: "Failed to sync notifications" }, { status: 500 });
  }
}
