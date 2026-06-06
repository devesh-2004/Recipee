// src/app/api/nutrition/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/rbac";
import { groqChat } from "@/lib/groq";

// Extract the first JSON object from a model response, tolerating
// markdown code fences and surrounding prose.
function parseNutritionJSON(text: string) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // 🔒 RBAC: only authenticated users may analyze nutrition.
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { query } = await req.json();

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const prompt = `Estimate the TOTAL combined nutrition for this meal: "${query}".
Respond with ONLY a raw JSON object using this exact shape:
{"calories": <number kcal>, "protein": <number grams>, "fat": <number grams>, "carbs": <number grams>}
All values must be plain integers. If the input is not food, return all zeros.`;

    const text = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a nutrition database that returns only valid JSON nutrition estimates.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.2, json: true }
    );

    const parsed = parseNutritionJSON(text);

    if (!parsed) {
      console.error("❌ Could not parse Groq nutrition response:", text);
      return NextResponse.json(
        { error: "No nutrition data found for this food" },
        { status: 404 }
      );
    }

    const result = {
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("❌ Nutrition API Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to analyze nutrition", details: error?.message },
      { status: 500 }
    );
  }
}
