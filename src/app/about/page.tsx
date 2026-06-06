"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { ChefHat, Sparkles, History, Target, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const About = () => {

   const { data: session } = useSession();
  const router = useRouter();
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const handleCTA = () => {
    if (session) {
      router.push("/recipe"); // user logged in
    } else {
      router.push("/login"); // user not logged in
    }
  }
  // ✅ Memoized values to prevent re-renders
  const values = useMemo(
    () => [
      {
        icon: Sparkles,
        title: "Innovation",
        description:
          "We harness the power of cutting-edge AI to revolutionize how people cook, eat, and experience food — bringing intelligence to every meal.",
      },
      {
        icon: History,
        title: "Save History",
        description:
          "Every recipe you explore is part of your food journey. EatoAI saves your history so you can revisit favorite meals, track your nutrition, and evolve your cooking style over time.",
      },
      {
        icon: Target,
        title: "Simplicity",
        description:
          "We believe great cooking shouldn’t be complicated. Our mission is to make healthy, personalized meal planning effortless and accessible for everyone — regardless of experience or resources.",
      },
      {
        icon: Lightbulb,
        title: "Creativity",
        description:
          "Cooking is an art, and EatoAI is your creative partner. We inspire you to experiment with unique ingredients, new flavors, and innovative techniques that make every dish special.",
      },
    ],
    []
  );



  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white overflow-hidden">
      {/* 🔹 Animated Background */}
      {init && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
              number: { value: 35 },
              color: { value: "#f97316" },
              opacity: { value: 0.25 },
              size: { value: 2.8 },
              move: { enable: true, speed: 1, random: true },
            },
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {/* 🔸 Hero Section */}
      <motion.section
        className="relative z-10 py-20 px-4 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <ChefHat className="h-16 w-16 text-orange-600 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-bold text-gray-900 mb-4">About EatoAI</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We’re building the future of food with AI — where every meal is
          personalized, nutritious, and crafted to fit your lifestyle.
        </p>
      </motion.section>

      {/* 🔸 Our Story */}
      <motion.section
        className="py-20 px-4 bg-white relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-5">
              EatoAI began with one simple goal — to make cooking easy and
              enjoyable for everyone. We know how stressful it can be to decide
              what to eat every day, especially with limited time and
              ingredients.
            </p>
            <p className="text-lg text-gray-600 mb-5">
              That’s why our team of passionate food lovers and AI engineers
              built EatoAI — your intelligent kitchen companion that learns your
              taste, lifestyle, and diet preferences to suggest recipes that fit
              your goals.
            </p>
            <p className="text-lg text-gray-600">
              From busy professionals to health enthusiasts, EatoAI helps you
              cook smarter, eat better, and rediscover the joy of cooking.
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-8 h-96 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <ChefHat className="h-24 w-24 text-orange-600 mx-auto mb-4" />
                <p className="text-2xl font-semibold text-gray-800">
                  Intelligence in every bite
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 🔸 Our Values */}
      <motion.section
        className="py-20 px-4 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            The principles that guide everything we do at EatoAI
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card className="border-orange-100 shadow-md hover:shadow-orange-200 transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 🔸 Stats Section */}
      <motion.section
        className="py-20 px-4 bg-white relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            ["100+", "Recipes Generated"],
            ["200+", "Happy Cooks"],
            ["95%", "Satisfaction Rate"],
          ].map(([stat, label], i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stat}
              </div>
              <div className="text-lg text-gray-600">{label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 🔸 Call to Action */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-r from-orange-600 to-amber-600 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and start creating amazing recipes with AI today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleCTA}
            className="text-lg px-8 py-3 hover:scale-105 transition-all cursor-pointer"
          >
            Try EatoAI Now
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
