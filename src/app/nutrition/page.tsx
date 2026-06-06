"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Apple, Info } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Header from "@/components/Header";

export default function NutritionAnalyzer() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [nutrition, setNutrition] = useState<any>(null);
  const [, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = ["#14c38e", "#ff6b6b", "#4d96ff", "#f5b400"];

  // Load user profile (email comes from the NextAuth session, not localStorage)
  useEffect(() => {
    const email = session?.user?.email;
    if (email) {
      fetchProfile(email);
    }
  }, [session]);

  const fetchProfile = async (email: string) => {
    try {
      const res = await axios.get(`/api/profile?email=${email}`);
      const data = res.data;

      if (data) {
        const { age, gender, height, weight, activityLevel } = data;

        const bmr =
          gender === "male"
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        const multiplier =
          activityLevel === "low"
            ? 1.2
            : activityLevel === "moderate"
            ? 1.55
            : 1.725;

        const dailyCalories = Math.round(bmr * multiplier);

        setProfile({ ...data, dailyCalories });
      }
    } catch (err) {
      console.error("Profile error:", err);
    }
  };

  // Analyze nutrition
  const analyzeNutrition = async () => {
    if (!query.trim()) {
      setError("Please enter a food name or ingredients 🍳");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      setError("Please login to analyze nutrition.");
      return;
    }

    setLoading(true);
    setError("");
    setNutrition(null);

    try {
      const res = await axios.post("/api/nutrition", {
        query,
        email,
      });

      if (res.data?.calories) {
        setNutrition(res.data);
      } else {
        setError("Unable to analyze this food right now 😕");
      }
    } catch (err: any) {
      console.error("Nutrition API error:", err?.response?.data || err);
      setError("Unable to analyze this food right now 😕");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!nutrition) return [];
    return [
      { name: "Calories", value: nutrition.calories },
      { name: "Protein", value: nutrition.protein },
      { name: "Fat", value: nutrition.fat },
      { name: "Carbs", value: nutrition.carbs },
    ];
  };

  return (
    <>
    <Header />
    <motion.div
      className="min-h-screen w-full bg-gradient-to-br from-orange-700 via-amber-600 to-yellow-500 flex flex-col items-center px-6 py-10 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* HEADER */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-6xl font-extrabold mb-3 flex items-center justify-center gap-3 drop-shadow-xl">
          <Apple className="w-12 h-12" />
          Nutrition Analyzer
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
          Enter your meal and let EatoAI break down the nutrition instantly.
        </p>
      </motion.div>

      {/* INPUT */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl bg-white/10 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20">
        <input
          type="text"
          placeholder="e.g. 1 banana, 2 eggs, 1 cup milk"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />

        <button
          onClick={analyzeNutrition}
          disabled={loading}
          className="px-7 py-3 bg-green-500 hover:bg-green-400 active:scale-95 transition rounded-2xl font-semibold flex items-center gap-2 shadow-xl"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <motion.p
          className="text-red-300 mt-4 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {/* RESULT */}
      {nutrition && (
        <motion.div
          className="mt-14 bg-white/10 border border-white/20 p-8 rounded-3xl w-full max-w-2xl backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-green-300 text-center">
            Nutrition Breakdown 🧩
          </h2>

          <div className="grid grid-cols-2 gap-4 text-lg mb-6 text-white/90">
            <p>
              🔥 Calories:{" "}
              <span className="text-green-400">{nutrition.calories} kcal</span>
            </p>
            <p>
              💪 Protein:{" "}
              <span className="text-green-400">{nutrition.protein} g</span>
            </p>
            <p>
              🥑 Fat: <span className="text-green-400">{nutrition.fat} g</span>
            </p>
            <p>
              🍞 Carbs:{" "}
              <span className="text-green-400">{nutrition.carbs} g</span>
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getChartData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {getChartData().map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <motion.div
            className="mt-10 p-4 bg-green-900/20 rounded-2xl border border-green-500/40 flex gap-3 items-start text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Info className="text-green-300 w-6 h-6 flex-shrink-0 mt-1" />
            <p className="text-green-100 text-sm leading-relaxed">
              Tip: Combine high-protein ingredients like eggs, oats, and Greek
              yogurt with fruits for a balanced and filling breakfast.
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
