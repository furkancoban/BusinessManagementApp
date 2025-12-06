"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    
    // Simulate smooth progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      setProgress(0);
    };
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/90 via-primary/80 to-primary shadow-lg shadow-primary/50"
            initial={{ width: "0%", x: "-100%" }}
            animate={{ 
              width: `${progress}%`,
              x: "0%",
              transition: {
                width: { duration: 0.3, ease: "easeOut" },
              }
            }}
            exit={{ 
              width: "100%",
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            style={{
              boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}