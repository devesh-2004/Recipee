"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Star } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Header from "@/components/Header";

interface HistoryItem {
  _id?: string;
  type?: "recipe" | "nutrition";
  timestamp: string;
  query?: string;
  favorite?: boolean;
  recipe?: {
    title?: string;
    ingredients?: string[];
    instructions?: string[];
  };
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // =====================================================
  // FETCH HISTORY
  // =====================================================
  const fetchHistory = useCallback(
    async (email: string, reset = false) => {
      try {
        setLoading(true);

        const res = await axios.get(
          `/api/meal-history?email=${email}&page=${
            reset ? 1 : page
          }&limit=${ITEMS_PER_PAGE}`
        );

        const data = Array.isArray(res.data) ? res.data : [];

        // Reset or append
        const updated = reset ? data : [...history, ...data];
        setHistory(updated);
        setFilteredHistory(updated);

        setHasMore(data.length === ITEMS_PER_PAGE);
        toast.error("Unable to load history.");
      } finally {
        setLoading(false);
        setLoading(false);
      }
    },
    [page, history]
  );

  // Fetch first load
  useEffect(() => {
    if (status === "loading") return;
    const email = session?.user?.email;
    if (!email) return;

    fetchHistory(email, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Fetch additional pages
  useEffect(() => {
    if (page === 1) return;
    const email = session?.user?.email;
    if (!email) return;

    fetchHistory(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadMore = () => setPage((prev) => prev + 1);

  // =====================================================
  // SEARCH FILTER
  // =====================================================
  useEffect(() => {
    if (!Array.isArray(history)) return;

    const filtered = history.filter((item) => {
      const title = item.recipe?.title?.toLowerCase() ?? "";
      const query = item.query?.toLowerCase() ?? "";
      const term = searchTerm.toLowerCase();
      return title.includes(term) || query.includes(term);
    });

    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  // =====================================================
  // Clear All History
  // =====================================================
  const clearAllHistory = async () => {
    const email = session?.user?.email;
    if (!email) return;

    try {
      await axios.delete(`/api/meal-history?all=true&email=${email}`);
      setHistory([]);
      setFilteredHistory([]);
      toast.success("All history cleared!");
    } catch {
      toast.error("Failed to clear history.");
    }
  };

  // =====================================================
  // Delete one entry
  // =====================================================
  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await axios.delete(`/api/meal-history?id=${id}`);
      const updated = history.filter((item) => item._id !== id);
      setHistory(updated);
      setFilteredHistory(updated);
      toast.success("Deleted!");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  // =====================================================
  // Favorite toggle
  // =====================================================
  const toggleFavorite = async (id: string, fav: boolean) => {
    try {
      await axios.patch(`/api/meal-history`, { id, favorite: !fav });

      const updated = history.map((item) =>
        item._id === id ? { ...item, favorite: !fav } : item
      );

      setHistory(updated);
      setFilteredHistory(updated);
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  // =====================================================
  // Copy entry
  // =====================================================
  const handleCopy = (item: HistoryItem) => {
    let text = "";

    if (item.recipe) {
      text = `${item.recipe.title}
Ingredients: ${item.recipe.ingredients?.join(", ")}
Instructions: ${item.recipe.instructions?.join(" ")}
`;
    } else if (item.nutrition) {
      text = `${item.query}
Calories: ${item.nutrition.calories} kcal
Protein: ${item.nutrition.protein}g
Carbs: ${item.nutrition.carbs}g
Fat: ${item.nutrition.fat}g
`;
    }

    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  // =====================================================
  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto p-6 space-y-10">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            🥗 Your History
          </h1>

          {/* CLEAR ALL BUTTON */}
          {history.length > 0 && (
            <div className="text-center">
              <Button variant="destructive" onClick={clearAllHistory}>
                Clear All History
              </Button>
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search recipes or items..."
              className="w-full max-w-md p-3 rounded-lg border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* HISTORY LIST */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {Array.isArray(filteredHistory) &&
              filteredHistory.map((item) => (
                <Card
                  key={item._id}
                  className="hover:shadow-xl transition border-orange-100"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {item.recipe?.title || item.query || "Untitled"}
                        </h2>

                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>

                        {/* Nutrition Info */}
                        {item.nutrition && (
                          <div className="text-gray-700 text-sm">
                            <p>🔥 {item.nutrition.calories} kcal</p>
                            <p>💪 {item.nutrition.protein} g protein</p>
                            <p>🥑 {item.nutrition.fat} g fat</p>
                            <p>🍞 {item.nutrition.carbs} g carbs</p>
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            toggleFavorite(item._id!, item.favorite || false)
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              item.favorite
                                ? "text-yellow-500 fill-yellow-500"
                                : ""
                            }`}
                          />
                        </Button>

                        <Button
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopy(item)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* LOAD MORE */}
          {hasMore && (
            <div className="text-center mt-6">
              <Button onClick={loadMore}>Load More</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
