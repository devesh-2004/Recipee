import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/rbac";
import { groqChat } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    // 🔒 RBAC: only authenticated users may use the AI chat.
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { message, userProfile } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "Message cannot be empty." });
    }

    const profileText = userProfile
      ? `User Profile:
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Height: ${userProfile.height}
Weight: ${userProfile.weight}
Activity Level: ${userProfile.activityLevel}
Daily Calories Goal: ${userProfile.dailyCalories}`
      : "No profile saved.";

    const SYSTEM_PROMPT = `
You are EatoAI, a friendly and expert AI nutrition coach.
Your goal is to help users eat healthy and cook delicious meals.

GUIDELINES:
1. **Structure is Key**: When asked for a recipe, ALWAYS use the following format:
   ### 🍽️ [Recipe Name]
   **⏱️ Prep time:** [Time] | **🍳 Cook time:** [Time] | **🔥 Calories:** [Approx]

   ### 🛒 Ingredients:
   * [Ingredient 1]
   * [Ingredient 2]
   ...

   ### 👩‍🍳 Instructions:
   1. **[Step Name]:** [Detailed instruction]
   2. **[Step Name]:** [Detailed instruction]
   ...

   ### 🥗 Nutrition (per serving):
   * **Protein:** [g]
   * **Carbs:** [g]
   * **Fats:** [g]

2. **Be Friendly**: Use emojis and an encouraging tone.
3. **Personalize**: Use the provided User Profile to adjust portion sizes or ingredients if needed.
4. **Formatting**: Use Markdown. Use **bold** for emphasis. Use lists for readability.
`;

    // --- Retry Logic (Groq can occasionally rate-limit) ---
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const reply = await groqChat([
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${profileText}\n\nUser: ${message}` },
        ]);

        return NextResponse.json({
          reply: reply || "I couldn't generate a response.",
        });
      } catch (error: any) {
        const msg = String(error?.message || "").toLowerCase();
        const retryable =
          msg.includes("rate") ||
          msg.includes("overloaded") ||
          msg.includes("busy") ||
          msg.includes("timeout");

        if (retryable && attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, attempt * 500));
          continue;
        }

        console.error("❌ Groq chat error:", error?.message);
        return NextResponse.json({ reply: "AI Error. Try again later." });
      }
    }

    return NextResponse.json({
      reply:
        "⚠️ AI is overloaded right now. Please wait a moment and try again.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      reply: "Server error. Please try again.",
    });
  }
}
