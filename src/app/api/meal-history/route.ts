import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCurrentUser, unauthorized, forbidden, resolveTargetEmail } from "@/lib/rbac";

const DB_NAME = "cookaro";
const COLLECTION = "mealHistory";

// =============================
// GET — Fetch History (own; admins may pass ?email=), with pagination
// =============================
export async function GET(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const url = new URL(req.url);
    const email = resolveTargetEmail(caller, url.searchParams.get("email"));
    if (!email) return forbidden();

    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const total = await db.collection(COLLECTION).countDocuments({ email });

    const history = await db
      .collection(COLLECTION)
      .find({ email })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      page,
      limit,
      total,
      data: history,
    });
  } catch (error) {
    console.error("❌ GET history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

// =============================
// POST — Save recipe OR nutrition (scoped to the caller)
// =============================
export async function POST(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const body = await req.json();
    const { recipe, query, nutrition } = body;

    const email = resolveTargetEmail(caller, body.email);
    if (!email) return forbidden();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (recipe) {
      await db.collection(COLLECTION).insertOne({
        email,
        type: "recipe",
        recipe,
        query,
        timestamp: new Date().toISOString(),
        favorite: false,
      });

      return NextResponse.json({
        success: true,
        message: "Recipe saved",
      });
    }

    if (nutrition) {
      await db.collection(COLLECTION).insertOne({
        email,
        type: "nutrition",
        nutrition,
        query,
        timestamp: new Date().toISOString(),
        favorite: false,
      });

      return NextResponse.json({
        success: true,
        message: "Nutrition saved",
      });
    }

    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  } catch (error) {
    console.error("❌ POST history error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// =============================
// PATCH — Toggle Favorite (only on the caller's own entries)
// =============================
export async function PATCH(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const { id, favorite } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const filter: Record<string, any> = { _id: new ObjectId(id) };
    if (caller.role !== "admin") filter.email = caller.email;

    const result = await db
      .collection(COLLECTION)
      .updateOne(filter, { $set: { favorite } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Entry not found or not permitted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Favorite updated",
    });
  } catch (error) {
    console.error("❌ PATCH history error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// =============================
// DELETE — Remove Single OR All History (scoped to the caller)
// =============================
export async function DELETE(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all");

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    //=========== DELETE ALL ===========
    if (all === "true") {
      const email = resolveTargetEmail(caller, url.searchParams.get("email"));
      if (!email) return forbidden();

      await db.collection(COLLECTION).deleteMany({ email });
      return NextResponse.json({
        success: true,
        message: "All history cleared",
      });
    }

    //=========== DELETE ONE ===========
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const filter: Record<string, any> = { _id: new ObjectId(id) };
    if (caller.role !== "admin") filter.email = caller.email;

    const result = await db.collection(COLLECTION).deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Entry not found or not permitted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
