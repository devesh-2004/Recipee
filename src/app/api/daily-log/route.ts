import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCurrentUser, unauthorized, forbidden, resolveTargetEmail } from "@/lib/rbac";

const DB_NAME = "cookaro"; // ✅ keep same DB everywhere
const COLLECTION = "dailyLogs";

// ================================
// GET — Fetch meals for TODAY (own; admins may pass ?email=)
// ================================
export async function GET(request: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const { searchParams } = new URL(request.url);
    const email = resolveTargetEmail(caller, searchParams.get("email"));
    if (!email) return forbidden();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const meals = await db
      .collection(COLLECTION)
      .find({
        email,
        date: { $gte: startOfToday },
      })
      .sort({ timestamp: -1 }) // newest first
      .toArray();

    return NextResponse.json(meals, { status: 200 });
  } catch (err) {
    console.error("❌ GET daily-log error:", err);
    return NextResponse.json(
      { error: "Failed to load daily logs" },
      { status: 500 }
    );
  }
}

// ================================
// POST — Add a new meal entry (scoped to the caller)
// ================================
export async function POST(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const body = await req.json();
    const { name, type } = body;

    const email = resolveTargetEmail(caller, body.email);
    if (!email) return forbidden();

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const entry = {
      ...body,
      email, // enforce the resolved owner, ignore any spoofed email
      date: new Date(), // for filtering by day
      timestamp: new Date().toISOString(), // for UI
      createdAt: new Date(),
    };

    await db.collection(COLLECTION).insertOne(entry);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ POST daily-log error:", err);
    return NextResponse.json({ error: "Failed to add meal" }, { status: 500 });
  }
}

// ================================
// DELETE — Remove ONE meal (only if it belongs to the caller)
// ================================
export async function DELETE(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Non-admins can only delete their own entries.
    const filter: Record<string, any> = { _id: new ObjectId(id) };
    if (caller.role !== "admin") filter.email = caller.email;

    const result = await db.collection(COLLECTION).deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Entry not found or not permitted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ DELETE daily-log error:", err);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
