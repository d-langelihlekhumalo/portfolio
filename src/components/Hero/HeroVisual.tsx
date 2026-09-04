/**
 * HeroVisual component - decorative visual element for hero section
 * Desktop only, rendered as abstract gradient shape
 */
export const HeroVisual = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-sm h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="grad1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient
            id="grad2"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#60D5FF" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Large circle with gradient */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="url(#grad1)"
          opacity="0.6"
        />

        {/* Secondary circle */}
        <circle
          cx="240"
          cy="180"
          r="110"
          fill="url(#grad2)"
          opacity="0.5"
        />

        {/* Accent circle */}
        <circle
          cx="160"
          cy="220"
          r="80"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Floating accent dots */}
        <circle
          cx="120"
          cy="120"
          r="6"
          fill="#38BDF8"
          opacity="0.4"
        />
        <circle
          cx="300"
          cy="140"
          r="4"
          fill="#0EA5E9"
          opacity="0.3"
        />
        <circle
          cx="280"
          cy="280"
          r="5"
          fill="#38BDF8"
          opacity="0.25"
        />
      </svg>

      {/* Floating animation via CSS */}
      <style>{`
        @keyframes float-hero {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .hero-visual {
          animation: float-hero 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

HeroVisual.displayName = 'HeroVisual'
