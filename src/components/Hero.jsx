import React from "react";
import { TextRotate } from "@/components/ui/text-rotate";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <nav className="flex items-center justify-between mb-16 animate-fade-in">
          <div className="flex items-center space-x-3">
            <img src="/pencil.png" alt="Outliner Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Outliner
            </span>
          </div>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300"
          >
            <img
              src="https://www.google.com/chrome/static/images/chrome-logo.svg"
              alt="Chrome logo"
              className="w-5 h-5"
            />
            <span className="font-semibold text-gray-800">Add to Chrome</span>
          </a>
        </nav>

        {/* Hero Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-slide-up">
          {/* Left Side - Text Content */}
          <div className="text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight bungee-regular">
              Summarize Any Webpage
              <br />
              <span
                className="text-white px-4 py-2 rounded-lg inline-block mt-3"
                style={{ backgroundColor: "#ff6347" }}
              >
                <TextRotate
                  texts={["in seconds", "in 3 modes", "100% free"]}
                  rotationInterval={2500}
                />
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed font-jost">
              Transform lengthy articles into concise summaries with AI-powered
              intelligence. Save time, stay informed, and boost your
              productivity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Install Free Extension</span>
              </a>
              <button
                className="btn-secondary w-full sm:w-auto"
                onClick={() => {
                  const el = document.getElementById("howitworks");
                  if (el) {
                    // Use native scrollIntoView which respects CSS scroll-margin-top
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  10K+
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  Active Users
                </div>
              </div>
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  500K+
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  Pages Summarized
                </div>
              </div>
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  4.9★
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  User Rating
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div
            className="relative animate-slide-up flex justify-center lg:justify-end"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative max-w-md w-full">
              {/* Stack effect - tilted rightwards */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl transform rotate-3 translate-x-2 translate-y-2 opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl transform rotate-2 translate-x-1 translate-y-1 opacity-60"></div>
              {/* Main image */}
              <img
                src="/hero.png"
                alt="Outliner Extension Demo"
                className="relative rounded-2xl shadow-2xl w-full h-auto transform -rotate-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
