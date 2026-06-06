"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChefHat, Loader2, X, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";

/* ----------------------- Types ----------------------- */
interface Recipe {
  idMeal: string;
  title: string;
  image?: string;
  category?: string;
  area?: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  recipes?: Recipe[];
}

/* ----------------------- Helpers ----------------------- */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();

const buildIngredientsFromMeal = (meal: any): string[] => {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`] ?? "";
    if (ing && ing.trim())
      ingredients.push(`${ing.trim()}${measure ? ` — ${measure.trim()}` : ""}`);
  }
  return ingredients;
};

const splitInstructions = (text?: string): string[] =>
  text
    ? text
        .split(/\r\n|\n{1,}|\.\s+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

async function fetchAPI(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

/* ----------------------- API Functions ----------------------- */
const searchByName = async (q: string, topN = 3): Promise<Recipe[]> => {
  try {
    const data = await fetchAPI(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        q
      )}`
    );
    const meals = data?.meals ?? [];
    return meals.slice(0, topN).map((meal: any) => ({
      idMeal: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      ingredients: buildIngredientsFromMeal(meal),
      instructions: splitInstructions(meal.strInstructions),
      cookTime: "30-45 mins",
    }));
  } catch {
    return [];
  }
};

const searchByCategory = async (
  category: string,
  topN = 3
): Promise<Recipe[]> => {
  try {
    const data = await fetchAPI(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
        category
      )}`
    );
    const meals = data?.meals ?? [];
    const details = await Promise.all(
      meals.slice(0, topN * 2).map(async (m: any) => {
        const d = await fetchAPI(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`
        );
        return d?.meals?.[0] ?? null;
      })
    );
    return details
      .filter(Boolean)
      .slice(0, topN)
      .map((meal: any) => ({
        idMeal: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
        ingredients: buildIngredientsFromMeal(meal),
        instructions: splitInstructions(meal.strInstructions),
        cookTime: "30-45 mins",
      }));
  } catch {
    return [];
  }
};

const searchByIngredients = async (
  ingredients: string[],
  topN = 3
): Promise<Recipe[]> => {
  try {
    const normalized = ingredients.map((i) => normalize(i));
    const matchCounts: Record<string, number> = {};
    const mealMeta: Record<string, { strMeal: string; strMealThumb: string }> =
      {};

    await Promise.all(
      normalized.map(async (ing) => {
        if (!ing) return;
        const data = await fetchAPI(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            ing
          )}`
        );
        const meals = data?.meals ?? [];
        meals.forEach((m: any) => {
          const id = m.idMeal;
          matchCounts[id] = (matchCounts[id] || 0) + 1;
          if (!mealMeta[id])
            mealMeta[id] = { strMeal: m.strMeal, strMealThumb: m.strMealThumb };
        });
      })
    );

    const sortedIds = Object.entries(matchCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN * 3);

    const details = (
      await Promise.all(
        sortedIds.map(async ({ id }) => {
          const d = await fetchAPI(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
          );
          return d?.meals?.[0] ?? null;
        })
      )
    ).filter(Boolean);

    const results = details.map((meal: any) => ({
      idMeal: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      ingredients: buildIngredientsFromMeal(meal),
      instructions: splitInstructions(meal.strInstructions),
      cookTime: "30-45 mins",
    }));

    return results.slice(0, topN);
  } catch {
    return [];
  }
};

/* ----------------------- Main Component ----------------------- */
export default function RecipePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content:
        "👋 Hey! Enter ingredients, dish names or categories (comma separated) and I'll find recipes for you.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [jsonLD, setJsonLD] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => [
      "Vegetarian",
      "Vegan",
      "Seafood",
      "Chicken",
      "Beef",
      "Dessert",
      "Pasta",
      "Tomato",
      "Potato",
      "Cheese",
    ],
    []
  );

  const categoryMap = useMemo(
    () => ({
      vegetarian: "Vegetarian",
      vegan: "Vegan",
      seafood: "Seafood",
      chicken: "Chicken",
      beef: "Beef",
      dessert: "Dessert",
      pasta: "Pasta",
    }),
    []
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const raw = inputValue.trim();
    if (!raw) return;
    setMessages((p) => [
      ...p,
      { id: `${Date.now()}-u-${Math.random().toString(36).substring(7)}`, type: "user", content: raw },
    ]);
    setInputValue("");
    setIsLoading(true);

    const queries = raw
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);
    const allRecipes: Recipe[] = [];

    for (const query of queries) {
      let recipes: Recipe[] = [];
      const lower = query.toLowerCase();

      const matchedCategory = Object.keys(categoryMap).find((key) =>
        lower.includes(key)
      );

     if (
       matchedCategory &&
       categoryMap[matchedCategory as keyof typeof categoryMap]
     ) {
       const categoryValue =
         categoryMap[matchedCategory as keyof typeof categoryMap];
       if (categoryValue) {
         recipes = await searchByCategory(categoryValue, 3);
       }
     }

      if (recipes.length === 0)
        recipes = await searchByIngredients(lower.split(/\s+/), 3);

      if (recipes.length === 0) recipes = await searchByName(query, 3);

      if (recipes.length > 0) {
        allRecipes.push(...recipes);
        toast.success(`Found ${recipes.length} recipes for "${query}" 🍲`);
      } else toast.error(`No recipes found for "${query}" ❌`);

      setMessages((p) => [
        ...p,
        {
          id: `${Date.now()}-b-${Math.random().toString(36).substring(7)}`,
          type: "bot",
          content: recipes.length
            ? `Top ${recipes.length} recipes for "${query}"`
            : `No recipes found for "${query}" 😢`,
          recipes,
        },
      ]);
    }

    // ✅ Generate structured JSON-LD data
    if (allRecipes.length > 0) {
      const schema = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        itemListElement: allRecipes.map((r, index) => ({
          "@type": "Recipe",
          position: index + 1,
          name: r.title,
          image: r.image,
          recipeCategory: r.category,
          recipeCuisine: r.area,
          cookTime: r.cookTime,
          recipeIngredient: r.ingredients,
          recipeInstructions: r.instructions.map((inst) => ({
            "@type": "HowToStep",
            text: inst,
          })),
          author: { "@type": "Organization", name: "EatoAI" },
        })),
      };
      setJsonLD(JSON.stringify(schema));
    }

    setIsLoading(false);
  }, [inputValue, categoryMap]);

  const handleCopy = useCallback((recipe: Recipe) => {
    const text = `Recipe: ${
      recipe.title
    }\n\nIngredients:\n${recipe.ingredients.join(
      "\n"
    )}\n\nInstructions:\n${recipe.instructions.join("\n")}`;
    navigator.clipboard.writeText(text);
    toast.success("Recipe copied!");
  }, []);

  if (!mounted) return null;

  return (
    <>
    <Header />
      <Head>
        <title>EatoAI Recipe Generator 🍲 | Smart Meal Ideas</title>
        <meta
          name="description"
          content="Generate AI-powered recipes using your ingredients. Get delicious meal ideas and nutrition insights instantly with EatoAI."
        />
        <meta
          name="keywords"
          content="EatoAI, recipe generator, AI cooking, meal planner, healthy recipes, food assistant"
        />
        <meta property="og:title" content="EatoAI Recipe Generator 🍲" />
        <meta
          property="og:description"
          content="Discover personalized AI-generated recipes with EatoAI – your smart cooking assistant."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://eatoai.vercel.app/recipe" />
        <meta property="og:image" content="/og-image.png" />
        <link rel="canonical" href="https://eatoai.vercel.app/recipe" />
        {jsonLD && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLD }}
          />
        )}
      </Head>

      <div className="max-w-4xl mx-auto p-4 flex flex-col h-[90vh]">
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestions.map((s) => (
            <Badge
              key={s}
              className="cursor-pointer hover:bg-green-200"
              onClick={() =>
                setInputValue((prev) => (prev ? prev + ", " + s : s))
              }
            >
              {s}
            </Badge>
          ))}
        </div>

        {/* Chat Messages */}
        
        <div className="flex-1 overflow-y-auto mb-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                } mb-3`}
              >
                <Card className="max-w-[75%] p-3">
                  <CardContent>
                    {msg.type === "bot" && (
                      <ChefHat className="w-5 h-5 mb-1 text-green-600" />
                    )}
                    <p>{msg.content}</p>
                    {msg.recipes?.map((r) => (
                      <div
                        key={r.idMeal}
                        className="mt-2 border rounded-lg p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 justify-between"
                      >
                        <div
                          className="flex items-center gap-2"
                          onClick={() => setSelectedRecipe(r)}
                        >
                          {r.image && (
                            <Image
                              src={r.image}
                              alt={r.title}
                              width={50}
                              height={50}
                              className="rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{r.title}</p>
                            <p className="text-sm text-gray-500">
                              {r.category}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(r)}
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type ingredients, dishes or categories..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Recipe Modal */}
        <AnimatePresence>
          {selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 overflow-auto"
              onClick={() => setSelectedRecipe(null)}
            >
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                exit={{ y: -50 }}
                className="bg-white rounded-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedRecipe(null)}
                >
                  <X />
                </Button>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedRecipe.title}
                </h2>
                {selectedRecipe.image && (
                  <Image
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    width={350}
                    height={200}
                    className="rounded-lg object-cover mb-4 w-full"
                  />
                )}
                <div className="flex gap-3 mb-4">
                  {selectedRecipe.category && (
                    <Badge>{selectedRecipe.category}</Badge>
                  )}
                  {selectedRecipe.area && <Badge>{selectedRecipe.area}</Badge>}
                  {selectedRecipe.cookTime && (
                    <Badge>{selectedRecipe.cookTime}</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4 flex items-center gap-1"
                  onClick={() => handleCopy(selectedRecipe)}
                >
                  <Copy className="w-4 h-4" />
                  Copy Recipe
                </Button>
                <h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
                <ul className="list-disc list-inside mb-4">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside">
                  {selectedRecipe.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
