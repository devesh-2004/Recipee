"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Header from "@/components/Header";

interface Meal {
  _id?: string;
  type: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
  timestamp?: string;
}

export default function DailyLog() {
  const { data: session, status } = useSession();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    type: "Breakfast",
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [profile, setProfile] = useState<any>(null);

  // read user/profile from the NextAuth session (not localStorage)
  useEffect(() => {
    if (status === "loading") return;

    const email = session?.user?.email;
    if (!email) {
      setLoading(false);
      return;
    }

    fetchMeals(email);
    // try to load profile (profile route stores daily info)
    const profileRaw =
      typeof window !== "undefined" ? localStorage.getItem("profile") : null;
    if (profileRaw) {
      try {
        setProfile(JSON.parse(profileRaw));
      } catch {
        setProfile(null);
      }
    } else {
      // fetch profile from server as fallback
      fetchProfile(email);
    }
     
  }, [session, status]);

  const fetchProfile = async (email: string) => {
    try {
      const res = await axios.get(`/api/profile?email=${email}`);
      if (res?.data) {
        setProfile(res.data);
        localStorage.setItem("profile", JSON.stringify(res.data));
      }
    } catch (err) {
      // non-fatal
      console.warn("Could not load profile:", err);
    }
  };

  const fetchMeals = async (email: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/daily-log?email=${encodeURIComponent(email)}`
      );
      // expect res.data to be array
      setMeals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch meals 😔");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new meal
  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.name.trim()) {
      toast.error("Please enter a meal name.");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      toast.error("User not found. Please login again.");
      return;
    }

    // sanitize numeric inputs
    const mealToSave: Meal = {
      type: (newMeal.type as Meal["type"]) || "Breakfast",
      name: (newMeal.name || "").trim(),
      calories: Number(newMeal.calories) || 0,
      protein: Number(newMeal.protein) || 0,
      carbs: Number(newMeal.carbs) || 0,
      fat: Number(newMeal.fat) || 0,
      timestamp: new Date().toISOString(),
    };

    try {
      setSaving(true);

      // optimistic UI: show new meal immediately with temporary _id
      const tempId = "temp-" + Date.now();
      setMeals((prev) => [{ ...mealToSave, _id: tempId }, ...prev]);

      const res = await axios.post("/api/daily-log", {
        email,
        ...mealToSave,
      });

      // replace temp entry with server returned item if available
      // if server returns the created object (some APIs do) use it otherwise refetch
      if (res.data && res.data.insertedId) {
        // If API returns insertedId we can refetch or update id
        await fetchMeals(email);
      } else {
        // fallback: refresh meals from server to ensure correct ids
        await fetchMeals(email);
      }

      toast.success(`${mealToSave.type} added successfully! 🍽️`);
      resetNewMeal();
    } catch (err) {
      console.error(err);
      // revert optimistic add
      setMeals((prev) =>
        prev.filter((m) => !m._id?.toString().startsWith("temp-"))
      );
      toast.error("Error adding meal 😕");
    } finally {
      setSaving(false);
    }
  };

  // Delete meal
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const email = session?.user?.email;
    if (!email) {
      toast.error("User not found.");
      return;
    }

    // optimistic removal
    const prev = meals;
    setMeals((m) => m.filter((x) => x._id !== id));

    try {
      await axios.delete(
        `/api/daily-log?id=${encodeURIComponent(id)}&email=${encodeURIComponent(
          email
        )}`
      );
      toast.success("Meal deleted successfully 🗑️");
    } catch (err) {
      console.error(err);
      setMeals(prev); // restore on failure
      toast.error("Error deleting meal.");
    }
  };

  const resetNewMeal = () => {
    setNewMeal({
      type: "Breakfast",
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };

  // totals & percentages
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fat: acc.fat + (Number(meal.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goalCalories = profile?.dailyCalories || 2000;
  const caloriePercent = Math.min(
    Math.round((totals.calories / goalCalories) * 100),
    100
  );

  // helpers
  const formatDateTime = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-500">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Page Title */}
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-orange-700 dark:text-orange-400">
              🍽️ Daily Meal Log
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your meals, calories, and macros for a healthier you!
            </p>
          </header>

          {/* Add Meal Form */}
          <Card className="p-4 border border-orange-200 dark:border-orange-800 shadow-md">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Add a Meal
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* MEAL TYPE */}
              <select
                value={newMeal.type}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    type: e.target.value as Meal["type"],
                  })
                }
                className="border rounded-md p-2 dark:bg-gray-800 dark:text-white"
                aria-label="Meal Type"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Snacks</option>
                <option>Dinner</option>
              </select>

              {/* MEAL NAME */}
              <Input
                placeholder="Meal name"
                value={newMeal.name}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, name: e.target.value })
                }
                aria-label="Meal name"
              />

              {/* CALORIES */}
              <Input
                placeholder="Calories"
                type="number"
                value={newMeal.calories === 0 ? "" : newMeal.calories}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, calories: Number(e.target.value) })
                }
                aria-label="Calories"
              />

              {/* PROTEIN */}
              <Input
                placeholder="Protein (g)"
                type="number"
                value={newMeal.protein === 0 ? "" : newMeal.protein}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, protein: Number(e.target.value) })
                }
                aria-label="Protein in grams"
              />

              {/* CARBS */}
              <Input
                placeholder="Carbs (g)"
                type="number"
                value={newMeal.carbs === 0 ? "" : newMeal.carbs}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, carbs: Number(e.target.value) })
                }
                aria-label="Carbs in grams"
              />

              {/* FATS */}
              <Input
                placeholder="Fats (g)"
                type="number"
                value={newMeal.fat === 0 ? "" : newMeal.fat}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, fat: Number(e.target.value) })
                }
                aria-label="Fats in grams"
              />
            </div>

            <Button
              onClick={handleAddMeal}
              className="mt-4 w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}{" "}
              Add Meal
            </Button>
          </Card>

          {/* Loading / Empty / Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          ) : meals.length === 0 ? (
            <Card className="p-6 text-center text-gray-500 dark:text-gray-400 border border-orange-100 dark:border-orange-800">
              <p>No meals logged yet. Start by adding one above! 🥗</p>
            </Card>
          ) : (
            <>
              {/* Daily Summary */}
              <Card className="border border-orange-200 dark:border-orange-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-orange-700 dark:text-orange-400">
                  📊 Daily Summary
                </h2>
                <p>
                  🔥 Calories: {totals.calories} kcal{" "}
                  {profile?.dailyCalories ? (
                    <span className="text-sm text-gray-500">
                      ({caloriePercent}% of {profile.dailyCalories})
                    </span>
                  ) : null}
                </p>
                <p>💪 Protein: {totals.protein} g</p>
                <p>🍞 Carbs: {totals.carbs} g</p>
                <p>🥑 Fats: {totals.fat} g</p>
                {profile?.dailyCalories && (
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${caloriePercent}%` }}
                    />
                  </div>
                )}
              </Card>

              {/* Meal List */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {meals.map((meal) => (
                  <Card
                    key={meal._id}
                    className="border border-orange-100 dark:border-orange-800 shadow-md hover:shadow-lg transition"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                            {meal.type}: {meal.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            🔥 {meal.calories} kcal | 💪 {meal.protein}g | 🍞{" "}
                            {meal.carbs}g | 🥑 {meal.fat}g
                          </p>
                          {meal.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              Logged at: {formatDateTime(meal.timestamp)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(meal._id)}
                            aria-label={`Delete ${meal.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
