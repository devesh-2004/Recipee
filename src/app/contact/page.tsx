"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ContactClient() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 text-white">
      {/* 🌌 Background Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
              number: { value: 30 },
              color: { value: "#f59e0b" },
              opacity: { value: 0.25 },
              size: { value: 3 },
              move: { enable: true, speed: 1, random: true },
            },
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {/* ✉️ Contact Section */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-6 py-24"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-orange-400 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-black/80 max-w-2xl mx-auto">
            Have questions, ideas, or feedback? We’d love to connect with you
            and hear your thoughts!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* 📞 Contact Info */}
          <motion.div
            className="space-y-8"
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {[
              {
                icon: Mail,
                title: "Email",
                text: "deveshpurohit275@gmail.com",
              },
              {
                icon: Phone,
                title: "Phone",
                text: "+91 9461042383",
              },
              {
                icon: MapPin,
                title: "Office",
                text: "Bikaner, Rajasthan, India",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/10 border border-gray-900/20 p-4 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gray-900/20 p-4 rounded-xl">
                  <Icon className="text-gray-900 h-6 w-6" />
                </div>
                <div className="text-black/70">
                  <h3 className="text-lg font-semibold text-black">{title}</h3>
                  <p className="text-black/70">{text}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* 📝 Contact Form */}
          <motion.form
            className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-900/20 space-y-6"
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Full Name
              </label>
              <Input
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className="bg-gray-900/60 text-white border-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Email Address
              </label>
              <Input
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="bg-gray-900/60 text-white border-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Message
              </label>
              <Textarea
                name="message"
                placeholder="Write your message here..."
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="bg-gray-900/60 text-white border-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <Button
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg flex items-center justify-center gap-2 transition-all duration-300"
              type="submit"
              disabled={loading}
            >
              <Send className="h-5 w-5" />
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </motion.section>

      {/* 🌒 Footer */}
      <Footer />
    </div>
    </>
  );
}
