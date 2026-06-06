"use client";

import React from "react";
import { ChefHat, User } from "lucide-react";
import { RiGithubLine } from "react-icons/ri";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="bg-gray-900 text-white py-10 px-6 sm:px-10 mt-10 border-t border-white/10"
      aria-label="Footer section"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
        {/* ✅ Logo & Brand Name */}
        <div
          className="flex items-center space-x-2"
          aria-label="EatoAI brand logo"
        >
          <ChefHat className="h-7 w-7 text-orange-400" aria-hidden="true" />
          <span className="text-2xl font-semibold tracking-wide">EatoAI</span>
        </div>

        {/* ✅ Tagline */}
        <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed">
          © {new Date().getFullYear()}{" "}
          <span className="text-orange-400 font-semibold">EatoAI</span>. All
          rights reserved.
          <br className="sm:hidden" />
          Crafted with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://devesh-purohit-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-300 hover:underline hover:text-orange-400 transition-colors duration-200"
          >
            Devesh Purohit
          </a>
        </p>

        {/* ✅ Social Links */}
        <nav
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 mt-2"
          aria-label="Social media links"
        >
          <a
            href="https://github.com/devesh-2004"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
            aria-label="GitHub profile"
          >
            <RiGithubLine
              className="h-6 w-6 sm:h-7 sm:w-7 text-orange-100 hover:text-orange-400 cursor-pointer"
              aria-hidden="true"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/devesh-purohit-06557b245/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
            aria-label="LinkedIn profile"
          >
            <FaLinkedin
              className="h-6 w-6 sm:h-7 sm:w-7 text-orange-100 hover:text-orange-400"
              aria-hidden="true"
            />
          </a>
          <a
            href="https://devesh-purohit-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
            aria-label="Personal portfolio"
          >
            <User
              className="h-6 w-6 sm:h-7 sm:w-7 text-orange-100 hover:text-orange-400"
              aria-hidden="true"
            />
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;