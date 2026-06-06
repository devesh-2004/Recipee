"use client";

import dynamic from "next/dynamic";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function LoginPage() {
  const { data: session } = useSession();

  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: ["#ff8c00", "#ffa200", "#fff5d1"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.3, max: 0.7 } },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        speed: 0.6,
        outModes: "out" as const, // Using const assertion to specify the literal type
      },
      links: {
        enable: true,
        color: "#ffaa33",
        distance: 130,
        opacity: 0.2,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
    },
  };

  return session ? (
    // ✅ After Login — Welcome Page
    <div className="flex items-center justify-center h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {init && <Particles id="tsparticles" options={particlesOptions} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[90%] max-w-sm bg-white/10 backdrop-blur-2xl rounded-3xl p-10 flex flex-col items-center border border-orange-400/20 shadow-[0_0_40px_-10px_rgba(255,140,0,0.4)]"
      >
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-500/80 shadow-lg mb-5">
          <img
            src={session.user?.image || ""}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-orange-400 mb-1">
          Welcome, {session.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-gray-300 mb-6">
          Ready to cook something delicious today?
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signIn()}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all"
        >
          Switch Account
        </motion.button>
      </motion.div>
    </div>
  ) : (
    // ✅ Login Page (Before Login)
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {init && <Particles id="tsparticles" options={particlesOptions} />}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-lg">
          Cookaro 🍳
        </h1>
        <p className="mt-3 text-lg text-gray-300 font-light">
          Your AI Cooking Companion
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => signIn("google")}
        className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl text-white hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg text-lg font-semibold"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-6 h-6"
        />
        <span>Sign in with Google</span>
      </motion.button>

      <p className="absolute bottom-6 text-sm text-gray-500">
        © 2025 Cookaro — Crafted with ❤️ by Manoj
      </p>
    </div>
  );
}
