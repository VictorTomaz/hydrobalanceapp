import { motion } from "framer-motion";

// Animated recreation of the HydroBalance logo — droplet, crescent moon,
// falling drip, and breathing lotus — built as SVG so each layer animates.
export default function SplashLogo({ size = 200 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.8, ease: "easeOut" },
        scale: { duration: 0.8, ease: "easeOut" },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{ width: size, height: size * (160 / 120) }}
    >
      <svg viewBox="0 0 120 160" width={size} height={size * (160 / 120)}>
        <defs>
          <linearGradient id="dropletGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#36f2e8" />
            <stop offset="100%" stopColor="#2e69d3" />
          </linearGradient>
          <linearGradient id="petalCenter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#b8d4f5" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="petalSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0def0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c4b5e8" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="petalOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5e8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9d8fd4" stopOpacity="0.25" />
          </linearGradient>
          <mask id="moonMask">
            <rect x="0" y="0" width="120" height="160" fill="black" />
            <circle cx="60" cy="52" r="13" fill="white" />
            <circle cx="54" cy="47" r="11" fill="black" />
          </mask>
        </defs>

        {/* Droplet container */}
        <path
          d="M60 8 C60 8 18 62 18 98 C18 121 37 142 60 142 C83 142 102 121 102 98 C102 62 60 8 60 8 Z"
          fill="url(#dropletGrad)"
        />
        {/* Droplet highlight */}
        <ellipse cx="40" cy="50" rx="8" ry="13" fill="white" opacity="0.28" />

        {/* Crescent moon */}
        <circle cx="60" cy="52" r="13" fill="white" mask="url(#moonMask)" />

        {/* Falling drip — repeats periodically */}
        <motion.circle
          cx="60"
          cy="68"
          r="3"
          fill="#87e8f5"
          initial={{ opacity: 0, cy: 67 }}
          animate={{ cy: [67, 88], opacity: [0, 0.9, 0] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            repeatDelay: 1.8,
            ease: "easeIn",
          }}
        />

        {/* Lotus — breathing pulse */}
        <motion.g
          transform="translate(60, 128)"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer-left petal */}
          <path
            d="M0 0 C-8 -12 -8 -30 0 -36 C8 -30 8 -12 0 0 Z"
            fill="url(#petalOuter)"
            opacity="0.5"
            transform="rotate(-58)"
          />
          {/* Outer-right petal */}
          <path
            d="M0 0 C-8 -12 -8 -30 0 -36 C8 -30 8 -12 0 0 Z"
            fill="url(#petalOuter)"
            opacity="0.5"
            transform="rotate(58)"
          />
          {/* Inner-left petal */}
          <path
            d="M0 0 C-7 -11 -7 -27 0 -32 C7 -27 7 -11 0 0 Z"
            fill="url(#petalSide)"
            opacity="0.7"
            transform="rotate(-28)"
          />
          {/* Inner-right petal */}
          <path
            d="M0 0 C-7 -11 -7 -27 0 -32 C7 -27 7 -11 0 0 Z"
            fill="url(#petalSide)"
            opacity="0.7"
            transform="rotate(28)"
          />
          {/* Center petal */}
          <path
            d="M0 0 C-6 -10 -6 -24 0 -29 C6 -24 6 -10 0 0 Z"
            fill="url(#petalCenter)"
            opacity="0.85"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}