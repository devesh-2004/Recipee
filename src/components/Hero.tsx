"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Clock,
  Users,
  ChartBarStackedIcon,
  CookieIcon,
  Bot,
  HeartPulse,
  Quote,
} from "lucide-react";
import { toast } from "sonner";

import { useSession } from "next-auth/react";

const Hero = () => {
  const { data: session } = useSession();
  const [liveUsers, setLiveUsers] = useState(2500); // starting user count
  const router = useRouter();

  useEffect(() => {
    // Simulate live counter increment (clean up properly)
    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartCooking = useCallback(() => {
    if (!session) {
      toast.error("Please login to start cooking!");
      router.push("/login");
      return;
    }
    router.push("/recipe");
  }, [session, router]);

  const features = useMemo(
    () => [
      {
        icon: Bot,
        title: "AI Chat Assistant 🤖",
        description:
          "Talk directly with EatoAI — your AI health companion that answers food questions, suggests recipes, and helps you make smarter meal decisions.",
      },
      {
        icon: CookieIcon,
        title: "Smart Recipe Generator 🍪",
        description:
          "Just type your ingredients — like ‘chicken, tomato, garlic’ — and EatoAI instantly creates tasty, healthy recipes with steps and nutrition info.",
      },
      {
        icon: HeartPulse,
        title: "Personalized Health Profile ❤️",
        description:
          "Enter your age, weight, height, and goals to get AI-tailored diet plans, calorie targets, and macro-balanced meals — just for your body type.",
      },
      {
        icon: ChartBarStackedIcon,
        title: "Daily Meal Log 📊",
        description:
          "Easily log what you eat daily, and track calories, proteins, carbs, and fats to maintain your fitness and health goals effortlessly.",
      },
      {
        icon: Clock,
        title: "Recipe History 🕒",
        description:
          "Never lose your favorite dishes again — every recipe you generate is saved automatically for easy access later.",
      },
      {
        icon: Users,
        title: "Community Driven 👩‍🍳",
        description:
          "Join a fast-growing family of food enthusiasts and fitness lovers who are using AI to cook smarter and eat better every day.",
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Aarav Sharma",
        role: "Fitness Enthusiast",
        feedback:
          "EatoAI completely changed my eating habits! It helps me create healthy meals that match my daily goals without wasting time thinking about what to cook.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        name: "Sneha Patel",
        role: "Working Professional",
        feedback:
          "As someone who’s always short on time, EatoAI makes cooking so effortless. The AI suggestions are creative, and I love how it tracks my nutrition.",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
      },
      {
        name: "Rohan Mehta",
        role: "College Student",
        feedback:
          "I used to skip meals or eat junk, but now EatoAI gives me healthy, affordable meal ideas using ingredients I already have. It’s a lifesaver!",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
      },
    ],
    []
  );

  return (

    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* 🔸 Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Smarter
              <span className="text-orange-600 block">
                Meals with EatoAI 🍳
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered cooking companion that transforms your daily
              ingredients into delicious, healthy, and personalized recipes —
              crafted just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3 animate-scale-in"
                onClick={handleStartCooking}
                aria-label="Explore recipes"
              >
                Explore Recipes
                <ChefHat className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/about" aria-label="Learn more about EatoAI">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3 border-orange-200 hover:bg-orange-50"
                >
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Live User Counter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            EatoAI is growing every minute 🚀
          </h2>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Join a community of food lovers who trust AI to make cooking simpler
            and smarter.
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-2xl shadow-lg">
              <h3 className="text-5xl font-bold">
                {liveUsers.toLocaleString()}+
              </h3>
              <p className="text-lg mt-2 opacity-90">
                Active Users Cooking with AI
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-2xl shadow-lg">
              <h3 className="text-5xl font-bold">5k+</h3>
              <p className="text-lg mt-2 opacity-90">AI Recipes Generated</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-2xl shadow-lg">
              <h3 className="text-5xl font-bold">95%</h3>
              <p className="text-lg mt-2 opacity-90">User Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why EatoAI Stands Out ✨
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than just a recipe app — EatoAI is your personal AI-powered
              health and cooking assistant designed to make smart eating simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-orange-100 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <feature.icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-amber-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say ❤️
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Real experiences from real users who are redefining healthy eating
            with EatoAI.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <Card
                key={index}
                className="p-6 text-left shadow-md border border-orange-100 hover:shadow-lg transition-all bg-white"
              >
                <Quote className="h-8 w-8 text-orange-500 mb-4" />
                <p className="text-gray-700 italic mb-6 leading-relaxed">
                  “{t.feedback}”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-orange-400">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Cook Smarter? 🍽️</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers using EatoAI to cook better, track
            nutrition, and live healthier.
          </p>
          <Link href="/recipe" aria-label="Get started with EatoAI recipes">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3 hover:scale-105 transition-all"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Hero;
