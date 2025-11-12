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
        "Add Outliner to Chrome with one click from the Chrome Web Store. Quick setup, no configuration needed. Get started in seconds.",
      icon: "/download (1).png",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      id: "step-2",
      number: "02",
      title: "Setup Gemini API Key",
      description:
        "Get your free Gemini API key from Google AI Studio. Paste it in the extension settings to enable AI-powered summarization. It's quick and secure.",
      icon: "/key.png",
      gradient: "from-cyan-500 to-cyan-700",
    },
    {
      id: "step-3",
      number: "03",
      title: "Browse Any Page",
      description:
        "Navigate to any article, blog, research paper, or webpage you want to summarize. Works on millions of websites across the internet.",
      icon: "/world.png",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      id: "step-4",
      number: "04",
      title: "Choose Your Mode",
      description:
        "Select from Brief, Bullet Points, or Comprehensive summary style. Each mode is optimized for different reading preferences and use cases.",
      icon: "/choice.png",
      gradient: "from-pink-500 to-pink-700",
    },
    {
      id: "step-5",
      number: "05",
      title: "Get Instant Summary",
      description:
        "Click summarize and get your AI-generated summary in seconds. Powered by advanced AI that understands context and delivers accurate results.",
      icon: "/summary.png",
      gradient: "from-indigo-500 to-indigo-700",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12">
          {/* Left Side - Sticky Header */}
          <div className="left-0 top-0 md:sticky md:h-screen md:pt-8 flex flex-col justify-start">
            <h5 className="text-xs uppercase tracking-wide text-gray-600 mb-2">
              How It Works
            </h5>
            <h2 className="mb-6 text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Get started in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                less than a minute
              </span>
            </h2>
            <p className="max-w-prose text-lg text-gray-600 mb-8">
              Outliner makes web summarization effortless. Follow these simple
              steps to transform how you consume online content. No technical
              knowledge required.
            </p>

            {/* Lottie Animation */}
            <div className="hidden lg:block mb-8 w-80 h-80 ml-8">
              <DotLottieReact
                src="https://lottie.host/294e03ea-eff7-4fce-9cf8-c04a63e737dd/xngT6S3DDG.lottie"
                loop
                autoplay
                style={{ background: "transparent" }}
              />
            </div>
          </div>

          {/* Right Side - Stacked Cards */}
          <ContainerScroll className="min-h-[400vh] space-y-6 py-12 px-8">
            {steps.map((step, index) => (
              <CardSticky
                key={step.id}
                index={index + 2}
                className="w-full lg:max-w-[560px] rounded-2xl border-2 border-white/50 p-5 shadow-xl backdrop-blur-md bg-white/80 hover:bg-white transition-all duration-300 mx-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-8 h-8 object-contain"
                  />
                  <h3
                    className={`text-2xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}
                  >
                    {step.number}
                  </h3>
                </div>

                <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
                  {step.title}
                </h2>

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
