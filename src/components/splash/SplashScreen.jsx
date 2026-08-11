import { motion } from "framer-motion";
import SplashLogo from "./SplashLogo";

export default function SplashScreen() {
  return (
    <motion.div
      key="splash"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center no-select"
      style={{ background: "linear-gradient(180deg, #0e0e18 0%, #4c2a9a 100%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <SplashLogo size={200} />
      <motion.h1
        className="font-heading text-3xl font-extrabold tracking-tight mt-6"
        style={{
          background: "linear-gradient(90deg, #36f2e8 0%, #6a53d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        HydroBalance
      </motion.h1>
    </motion.div>
  );
}