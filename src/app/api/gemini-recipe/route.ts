import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/rbac";
import { groqChat } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    // 🔒 RBAC: only authenticated users may generate recipes.
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const recipeText = await groqChat(
      [
        {
          role: "system",
          content: "You are a master chef AI that writes clear, structured recipes in plain text.",
        },
        {
          role: "user",
          content: `Based on this input: "${prompt}", generate a detailed recipe including:
1️⃣ Recipe Title
2️⃣ Ingredients List
3️⃣ Step-by-step Instructions
Keep it simple, structured, and in plain text.`,
        },
      ],
      { temperature: 0.7, max_tokens: 800 }
    );

    return NextResponse.json({
      recipe: recipeText || "Sorry, I couldn't generate a recipe.",
    });
  } catch (error: any) {
    console.error("❌ Groq recipe request failed:", error?.message);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
