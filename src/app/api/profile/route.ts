// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser, unauthorized, forbidden, resolveTargetEmail } from "@/lib/rbac";

const DB_NAME = "cookaro";
const COLLECTION = "profiles";

// Clean profile before sending to frontend
function cleanProfile(user: any) {
  if (!user) return null;

  return {
    email: user.email,
    age: Number(user.age) || 0,
    gender: user.gender || "",
    height: Number(user.height) || 0,
    weight: Number(user.weight) || 0,
    activityLevel: user.activityLevel || "low",
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

/* ============================================================
   GET — fetch profile (own profile; admins may pass ?email=)
   ============================================================ */
export async function GET(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const { searchParams } = new URL(req.url);
    const email = resolveTargetEmail(caller, searchParams.get("email"));
    if (!email) return forbidden();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const user = await db.collection(COLLECTION).findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(cleanProfile(user), { status: 200 });
  } catch (err: any) {
    console.error("❌ GET profile error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST — create or update profile (own profile; admins any email)
   ============================================================ */
export async function POST(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller) return unauthorized();

    const body = await req.json();
    const { age, gender, height, weight, activityLevel } = body;

    const email = resolveTargetEmail(caller, body.email);
    if (!email) return forbidden();

    const now = new Date();

    const updateFields = {
      age: Number(age) || 0,
      gender: gender || "",
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      activityLevel: activityLevel || "low",
      updatedAt: now,
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { email },
      {
        $set: updateFields,
        $setOnInsert: {
          email,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const saved = cleanProfile(result?.value || null);

    return NextResponse.json(
      {
        message: "Profile saved successfully",
        profile: saved,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ POST profile error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
