import React from "react";
import { GlowCard } from "@/components/ui/spotlight-card";

const Modes = () => {
  const modes = [
    {
      name: "Brief Mode",
      icon: "⚡",
      color: "blue",
      description:
        "Perfect for quick reads and instant insights, so you never miss the main idea.",
      features: [
        "Ultra-fast",
        "Key points only",
        "Mobile-friendly",
        "No fluff",
      ],
    },
    {
      name: "Bullet Points",
      icon: "📝",
      color: "green",
      description: "Great for study notes, referencing, and easy scanning.",
      features: [
        "Easy to scan",
        "Organized format",
        "Copy & paste ready",
        "Saves time",
      ],
    },
    {
      name: "Comprehensive",
      icon: "📚",
      color: "purple",
      description: "Ideal for thorough understanding and research.",
      features: [
        "Full context",
        "Detailed insights",
        "No info loss",
        "Best for research",
      ],
    },
  ];

  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-blue-700",
      border: "border-blue-200",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700",
    },
    green: {
      bg: "from-green-500 to-emerald-700",
      border: "border-green-200",
      text: "text-green-600",
      badge: "bg-green-100 text-green-700",
    },
    purple: {
      bg: "from-purple-500 to-purple-700",
      border: "border-purple-200",
      text: "text-purple-600",
      badge: "bg-purple-100 text-purple-700",
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-left">
          <div className="inline-block bg-green-600/90 px-4 py-2 shadow-lg mb-4">
            <h2 className="text-4xl sm:text-4xl font-bold text-white bungee-regular">
              CHOOSE YOUR SUMMARY STYLE
            </h2>
          </div>
          <p className="text-xl text-white/90 max-w-2xl font-semibold mt-2 ml-4">
            Three intelligent modes to match your reading preference.
            <br />
            Pick the one that fits your workflow best.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {modes.map((mode, idx) => {
            // Map mode name to icon file
            let iconSrc = "";
            if (mode.name === "Brief Mode") iconSrc = "/brief.png";
            else if (mode.name === "Bullet Points") iconSrc = "/bullets.png";
            else if (mode.name === "Comprehensive")
              iconSrc = "/comprehension.png";
            return (
              <div
                key={mode.name}
                className="flex-1 p-6 flex flex-col justify-between bg-white/5 rounded-2xl border border-white/20 lg:hidden"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={mode.name + " icon"}
                        className="w-7 h-7"
                      />
                    )}
                    <h3 className="text-2xl font-bold anton-regular uppercase text-white">
                      {mode.name}
                    </h3>
                  </div>
                  <p className="text-base lg:text-lg text-gray-300 mb-3 font-jost">
                    {mode.description}
                  </p>
                  <ul className="list-none grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-white">
                        <img
                          src="/checkmark.png"
                          alt="checkmark"
                          className="w-5 h-5 mt-1 opacity-70"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          {modes.map((mode, idx) => {
            // Map mode name to icon file for desktop
            let iconSrc = "";
            if (mode.name === "Brief Mode") iconSrc = "/brief.png";
            else if (mode.name === "Bullet Points") iconSrc = "/bullets.png";
            else if (mode.name === "Comprehensive")
              iconSrc = "/comprehension.png";
            return (
              <GlowCard
                key={mode.name + "-desktop"}
                glowColor="green"
                customSize={true}
                className="flex-1 p-6 flex-col justify-between bg-white/5 hidden lg:flex"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={mode.name + " icon"}
                        className="w-7 h-7"
                      />
                    )}
                    <h3 className="text-2xl font-bold anton-regular uppercase text-white">
                      {mode.name}
                    </h3>
                  </div>
                  <p className="text-base lg:text-lg text-gray-300 mb-3 font-jost">
                    {mode.description}
                  </p>
                  <ul className="list-none grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-white">
                        <img
                          src="/checkmark.png"
                          alt="checkmark"
                          className="w-5 h-5 mt-1 opacity-70"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            );
          })}
        </div>
        <hr className="border-2 border-green-700 my-10" />
      </div>
    </section>
  );
};

export default Modes;
