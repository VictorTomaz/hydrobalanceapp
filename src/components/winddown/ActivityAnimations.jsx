import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BreathingAnimation() {
  const [phase, setPhase] = useState("Breathe in");

  useEffect(() => {
    const outTimer = setTimeout(() => setPhase("Breathe out"), 4000);
    const interval = setInterval(() => {
      setPhase("Breathe in");
      setTimeout(() => setPhase("Breathe out"), 4000);
    }, 10000);
    return () => {
      clearTimeout(outTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8AB8F2] to-[#2BC4BB]"
        animate={{ scale: [1, 1.4, 1.4, 1] }}
        transition={{ duration: 10, times: [0, 0.4, 0.5, 1], repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="font-heading font-bold text-lg text-[#3A4759] dark:text-slate-200">{phase}</p>
    </div>
  );
}

export function StretchingAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.div
        className="text-6xl"
        animate={{ rotate: [0, -15, 0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🧘
      </motion.div>
      <p className="font-heading font-bold text-lg text-[#3A4759] dark:text-slate-200 text-center">Gently tilt side to side</p>
    </div>
  );
}

export function JournalingAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-6xl">📓</div>
      <div className="w-48 space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-[#D8D2EB]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, delay: i * 1.3, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
          />
        ))}
      </div>
      <p className="font-heading font-bold text-lg text-[#3A4759] dark:text-slate-200 text-center">Write down what's on your mind</p>
    </div>
  );
}

export function GratitudeAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="text-4xl"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 3, delay: i, repeat: Infinity, ease: "easeInOut" }}
          >
            ⭐
          </motion.span>
        ))}
      </div>
      <p className="font-heading font-bold text-lg text-[#3A4759] dark:text-slate-200 text-center">Think of three things you're grateful for</p>
    </div>
  );
}