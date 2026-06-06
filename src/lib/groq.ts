// src/lib/groq.ts
// Thin wrapper around Groq's OpenAI-compatible Chat Completions API.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Current Groq production model. Override per-call via options.model if needed.
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  /** Force a strict JSON object response. */
  json?: boolean;
}

/**
 * Send a chat completion request to Groq and return the assistant text.
 * Throws on a missing key or an API-level error.
 */
export async function groqChat(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || GROQ_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.max_tokens ? { max_tokens: options.max_tokens } : {}),
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Groq request failed");
  }

  return data?.choices?.[0]?.message?.content || "";
}
