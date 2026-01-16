"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomeAnimations() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Generate floating circles with various sizes and colors - MORE VISIBLE (PROFESSIONAL BLUE-GREEN THEME)
    const circles = [
        // Large circles
        { id: 1, x: 10, y: 20, size: 500, color: "bg-sky-600", opacity: 0.25, blur: 100, duration: 25, delay: 0 },
        { id: 2, x: 80, y: 60, size: 450, color: "bg-emerald-600", opacity: 0.2, blur: 100, duration: 30, delay: 2 },
        { id: 3, x: 60, y: 10, size: 400, color: "bg-teal-600", opacity: 0.25, blur: 100, duration: 28, delay: 1 },

        // Medium circles
        { id: 4, x: 25, y: 70, size: 300, color: "bg-cyan-500", opacity: 0.2, blur: 80, duration: 20, delay: 3 },
        { id: 5, x: 90, y: 30, size: 280, color: "bg-teal-500", opacity: 0.2, blur: 80, duration: 22, delay: 0 },
        { id: 6, x: 50, y: 85, size: 320, color: "bg-blue-500", opacity: 0.25, blur: 80, duration: 18, delay: 4 },
        { id: 7, x: 5, y: 50, size: 250, color: "bg-emerald-500", opacity: 0.2, blur: 80, duration: 24, delay: 2 },

        // Small circles
        { id: 8, x: 70, y: 40, size: 180, color: "bg-sky-400", opacity: 0.3, blur: 60, duration: 15, delay: 1 },
        { id: 9, x: 35, y: 25, size: 150, color: "bg-teal-400", opacity: 0.3, blur: 60, duration: 16, delay: 3 },
        { id: 10, x: 85, y: 85, size: 200, color: "bg-cyan-400", opacity: 0.25, blur: 60, duration: 14, delay: 0 },
        { id: 11, x: 15, y: 90, size: 160, color: "bg-emerald-400", opacity: 0.3, blur: 60, duration: 18, delay: 5 },
        { id: 12, x: 45, y: 55, size: 140, color: "bg-sky-300", opacity: 0.3, blur: 50, duration: 12, delay: 2 },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {/* Animated circles */}
            {circles.map((circle) => (
                <motion.div
                    key={circle.id}
                    className={`absolute rounded-full ${circle.color}`}
                    style={{
                        left: `${circle.x}%`,
                        top: `${circle.y}%`,
                        width: circle.size,
                        height: circle.size,
                        transform: 'translate(-50%, -50%)',
                        opacity: circle.opacity,
                        filter: `blur(${circle.blur}px)`,
                    }}
                    animate={{
                        x: [0, 120, -100, 80, 0],
                        y: [0, -100, 80, -120, 0],
                        scale: [1, 1.3, 0.85, 1.15, 1],
                    }}
                    transition={{
                        duration: circle.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: circle.delay,
                    }}
                />
            ))}
        </div>
    );
}
