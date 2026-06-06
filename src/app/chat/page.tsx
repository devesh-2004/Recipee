"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";


// ✅ Helper function for formatting text
// ✅ Helper function for formatting text
function formatText(text: string) {
  if (!text) return "";
  return text
    // Headers (### Header)
    .replace(/### (.*?)(\n|$)/g, "<h3 class='text-lg font-bold text-orange-700 mt-4 mb-2'>$1</h3>")
    // Bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-gray-900'>$1</strong>")
    // Bullet points (* item)
    .replace(/^\* (.*?)(\n|$)/gm, "<li class='ml-4 list-disc text-gray-700'>$1</li>")
    // Numbered lists (1. item)
    .replace(/^\d+\. (.*?)(\n|$)/gm, "<li class='ml-4 list-decimal text-gray-700 mb-1'>$1</li>")
    // Line breaks
    .replace(/\n/g, "<br>")
    // Cleanup
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "bot",
      text: "👋 Hi! I’m EatoAI — your smart nutrition assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);


  // Scroll to bottom when new messages appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

    setInput("");
    setLoading(true);

    const profileData = JSON.parse(localStorage.getItem("profile") || "{}");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userProfile: profileData }),
      });

      const data = await res.json();
      const botReply = {
        role: "bot",
        text: data.reply || "Hmm... something went wrong.",
      };

      setMessages((prev) => [...prev, botReply]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Unable to connect. Please try again." },
      ]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 p-4 pb-24">
          <h1 className="text-3xl font-bold text-center text-orange-700 mb-4">
            🤖 EatoAI Chat Assistant
          </h1>

          {/* Chat Box */}
          <div className="flex-1 overflow-y-auto space-y-4 bg-white/60 rounded-xl p-4 border border-orange-100 shadow-inner">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.role === "bot" && (
                  <Bot className="w-6 h-6 text-orange-600 shrink-0" />
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-orange-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                ></div>
                {msg.role === "user" && (
                  <User className="w-6 h-6 text-gray-600 shrink-0" />
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2 text-gray-600 text-sm">
                <Loader2 className="animate-spin h-4 w-4" /> EatoAI is
                thinking...
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          {/* Input Section */}
          <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <div className="flex gap-2 bg-white border border-orange-200 shadow-lg p-2 rounded-2xl w-[90%] max-w-2xl">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something... e.g. high protein meal under 500 calories"
                className="flex-1 border-none focus:ring-0"
              />
              <Button
                onClick={handleSend}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
