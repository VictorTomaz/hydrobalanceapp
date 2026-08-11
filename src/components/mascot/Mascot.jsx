import { motion } from "framer-motion";

// A cute droplet mascot whose expression reacts to hydration progress
export default function Mascot({ percent = 0, size = 120, bounce = false }) {
  const mood = percent >= 100 ? "thrilled" : percent >= 50 ? "happy" : percent >= 20 ? "neutral" : "thirsty";

  const colors = {
    thrilled: "#2BC4BB",
    happy: "#5FE0B8",
    neutral: "#8AB8F2",
    thirsty: "#F7C59F",
  };

  const faces = {
    thrilled: (
      <>
        <circle cx="42" cy="55" r="5" fill="#2D3142" />
        <circle cx="68" cy="55" r="5" fill="#2D3142" />
        <path d="M40 70 Q55 85 70 70" stroke="#2D3142" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    happy: (
      <>
        <circle cx="42" cy="55" r="4.5" fill="#2D3142" />
        <circle cx="68" cy="55" r="4.5" fill="#2D3142" />
        <path d="M42 68 Q55 78 68 68" stroke="#2D3142" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    neutral: (
      <>
        <circle cx="42" cy="55" r="4.5" fill="#2D3142" />
        <circle cx="68" cy="55" r="4.5" fill="#2D3142" />
        <line x1="43" y1="72" x2="67" y2="72" stroke="#2D3142" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
    thirsty: (
      <>
        <path d="M37 52 Q42 48 47 52" stroke="#2D3142" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M63 52 Q68 48 73 52" stroke="#2D3142" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M43 74 Q55 66 67 74" stroke="#2D3142" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <motion.div
      animate={bounce ? { y: [0, -14, 0], rotate: [0, -3, 3, 0] } : { y: [0, -4, 0] }}
      transition={{ duration: bounce ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 110 130" width={size} height={size}>
        <path
          d="M55 5 C55 5 15 55 15 85 C15 108.7 32.9 125 55 125 C77.1 125 95 108.7 95 85 C95 55 55 5 55 5 Z"
          fill={colors[mood]}
        />
        <ellipse cx="35" cy="45" rx="8" ry="12" fill="white" opacity="0.35" />
        {faces[mood]}
      </svg>
    </motion.div>
  );
}