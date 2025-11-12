import React from "react";

const Modes = () => {
  const modes = [
    {
      name: "Brief Mode",
      icon: "⚡",
      color: "blue",
      description: "Quick overview in 2-3 sentences",
      example:
        "Perfect for scanning headlines and getting the gist of an article in seconds.",
      features: ["Ultra-fast", "Key points only", "Mobile-friendly"],
    },
    {
      name: "Bullet Points",
      icon: "📝",
      color: "green",
      description: "Structured list of main ideas",
      example:
        "Organized breakdown of key concepts, perfect for study notes and reference.",
      features: ["Easy to scan", "Organized format", "Copy & paste ready"],
    },
    {
      name: "Comprehensive",
      icon: "📚",
      color: "purple",
      description: "Detailed summary with context",
      example:
        "In-depth analysis preserving important details and nuances of the content.",
      features: ["Full context", "Detailed insights", "No info loss"],
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Summary Style
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three intelligent modes to match your reading preference
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="flex justify-center">
            <img
              src="/summaryStyle.png"
              alt="Summary Styles"
              className="w-full max-w-md h-auto"
            />
          </div>

          {/* Right Side - Mode Cards */}
          <div className="space-y-4">
            {modes.map((mode, index) => {
              const colors = colorClasses[mode.color];
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${colors.bg} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0 mt-1">
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{mode.name}</h3>
                      <p className="text-white/90 text-sm mb-3">
                        {mode.description}
                      </p>
                      <p className="text-white/80 text-xs italic mb-3">
                        "{mode.example}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mode.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Modes;
