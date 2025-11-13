import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack";

const HowItWorks = () => {
  const steps = [
    {
      id: "step-1",
      number: "01",
      title: "Install Extension",
      description:
        "Download and install the Outliner extension from the Chrome Web Store with a single click. The setup is quick and straightforward - no complex configuration required. Get up and running in just a few seconds and start summarizing immediately.",
      icon: "/download (1).png",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      id: "step-2",
      number: "02",
      title: "Setup Gemini API Key",
      description:
        "Get your free Gemini API key from Google AI Studio. Once you have the key, simply paste it into the extension settings. This enables the powerful AI-powered summarization feature. The entire process is secure, fast, and completely free to use.",
      icon: "/key.png",
      gradient: "from-cyan-500 to-cyan-700",
    },
    {
      id: "step-3",
      number: "03",
      title: "Browse Any Page",
      description:
        "Navigate to any article, blog post, research paper, news website, or any other webpage you want to summarize. The extension works seamlessly across millions of websites across the internet without any restrictions or limitations.",
      icon: "/world.png",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      id: "step-4",
      number: "04",
      title: "Choose Your Mode",
      description:
        "Select your preferred summary style from three intelligent modes: Brief for quick overviews, Bullet Points for organized key ideas, or Comprehensive for detailed analysis. Each mode is specially optimized for different reading preferences and use cases.",
      icon: "/choice.png",
      gradient: "from-pink-500 to-pink-700",
    },
    {
      id: "step-5",
      number: "05",
      title: "Get Instant Summary",
      description:
        "Click the summarize button and get your AI-generated summary in just seconds. Our advanced AI understands context, nuances, and delivers highly accurate results. Save time reading long articles while retaining all the important information.",
      icon: "/summary.png",
      gradient: "from-indigo-500 to-indigo-700",
    },
  ];

  return (
    <section className="relative min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      {/* Background blobs (like Hero) */}
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
      <div className="relative container mx-auto">
        <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12">
          {/* Left Side - Sticky Header */}
          <div className="left-0 top-0 md:sticky md:h-screen md:pt-8 flex flex-col justify-start pl-16">
            <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-2">
              How It Works
            </h5>
            <h2 className="mb-8 text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Get started in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                less than a minute
              </span>
            </h2>
            <p className="max-w-sm text-lg text-gray-600 mb-12">
              Outliner makes web summarization effortless. Follow these simple
              steps to transform how you consume online content. No technical
              knowledge required.
            </p>

            {/* Lottie Animation */}
            <div className="hidden lg:block mb-8 w-96 h-96 ml-8">
              <DotLottieReact
                src="https://lottie.host/294e03ea-eff7-4fce-9cf8-c04a63e737dd/xngT6S3DDG.lottie"
                loop
                autoplay
                style={{ background: "transparent" }}
              />
            </div>
          </div>

          {/* Right Side - Stacked Cards */}
          <ContainerScroll className="min-h-[160vh] lg:min-h-[120vh] space-y-6 py-12 px-8">
            {steps.map((step, index) => (
              <CardSticky
                key={step.id}
                index={index + 2}
                className="w-full lg:max-w-[560px] rounded-2xl border-2 border-white/50 p-5 shadow-xl backdrop-blur-md bg-white/80 hover:bg-white transition-all duration-300 mx-4"
              >
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-8 h-8 object-contain flex-shrink-0 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <h3
                        className={`text-2xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}
                      >
                        {step.number}
                      </h3>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900">
                        {step.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardSticky>
            ))}
          </ContainerScroll>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
