import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Features = () => {
  const features = [
    {
      icon: "/free.png",
      title: "100% Free",
      description:
        "Completely free to use! You only need to set up your own Gemini API key, which Google provides absolutely free for personal use with generous rate limits. No hidden charges, no premium plans required. Just pure summarization power at your fingertips.",
      gradient: "from-green-400 to-emerald-600",
      animation:
        "https://lottie.host/5f417ec9-1d77-4b37-aa9c-66fb7c8bd496/rUXPT9qBy1.lottie",
    },
    {
      icon: "/clutterfree.png",
      title: "Clutter-Free UI",
      description:
        "Beautiful, minimal interface with zero distractions. Everything you need at a glance with elegant dark mode support for comfortable browsing.",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      icon: "/world.png",
      title: "Works Everywhere",
      description:
        "Summarize any webpage instantly - articles, blogs, research papers, documentation, news sites, and more. Works seamlessly across all websites.",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      icon: "/fast.svg",
      title: "Insanely Fast",
      description:
        "Lightning-quick AI summarization powered by Gemini 2.0 Flash. Get your summaries in seconds without any lag or loading delays.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: "/privacy.png",
      title: "Privacy First",
      description:
        "Your data is completely private. We don't store or track your content. Process everything securely with no third-party interference.",
      gradient: "from-red-400 to-pink-600",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-500">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-red-100 max-w-2xl mx-auto font-semibold">
            Everything you need to stay informed and productive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-2xl border-2 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {index === 0 ? (
                // Special layout for Free card with animation on right
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-shrink-0 h-16 flex items-center justify-center min-w-16">
                        {feature.icon.startsWith("/") ? (
                          <img
                            src={feature.icon}
                            alt={feature.title}
                            className="h-full object-contain"
                          />
                        ) : (
                          <div className="text-4xl">{feature.icon}</div>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 font-mono">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full lg:w-40 flex items-center justify-center lg:self-center">
                    {feature.animation && (
                      <DotLottieReact
                        src={feature.animation}
                        loop
                        autoplay
                        style={{ width: "160px", height: "160px" }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                // Regular layout for other cards
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-shrink-0 h-16 flex items-center justify-center min-w-16">
                      {feature.icon.startsWith("/") ? (
                        <img
                          src={feature.icon}
                          alt={feature.title}
                          className="h-full object-contain"
                        />
                      ) : (
                        <div className="text-4xl">{feature.icon}</div>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 font-mono">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
