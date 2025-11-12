import React from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Modes from "./components/Modes";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Hero />
      <Features />
      <Modes />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
