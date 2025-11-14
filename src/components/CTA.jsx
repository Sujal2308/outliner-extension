import React from "react";

const CTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: text and CTAs (center on small, left on lg) */}
        <div className="text-center lg:text-left lg:pr-8">
          <h2 className="text-4xl sm:text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight bungee-regular">
            Ready to Save Hours
            <br />
            Every Week?
          </h2>

          <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed font-jost">
            Join thousands of users who are already reading smarter with
            Outliner
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3 w-full sm:w-auto justify-center"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Install Free Now</span>
            </a>

            <button className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white hover:text-blue-600 transition-all duration-300 w-full sm:w-auto">
              View on GitHub
            </button>
          </div>

          {/* Trust badges moved to bottom-centered container */}

          {/* Social proof removed per request */}
        </div>

        {/* Right: image (hidden on smaller screens) */}
        <div className="hidden lg:flex justify-end items-center lg:pr-8">
          <img
            src="/summaryStyle.png"
            alt="Summary style"
            className="w-full max-w-lg object-contain mix-blend-multiply opacity-95"
          />
        </div>
      </div>

      {/* Glassmorphic strip full-bleed across viewport and badges centered */}
      <div className="absolute left-0 right-0 bottom-0 h-16 pointer-events-none z-10">
        <div className="w-full h-full bg-blue-800/30 backdrop-blur-md border-t border-b border-white/10"></div>
      </div>

      {/* Bottom-centered trust badges (vertically centered within strip) */}
      <div className="absolute left-0 right-0 bottom-0 flex justify-center z-20 pointer-events-auto">
        <div className="w-full h-16 flex items-center justify-center gap-8 text-white/90">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">100% Free</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">No Sign Up</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">
              Privacy Protected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">
              Open Source
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
