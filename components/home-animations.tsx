"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomeAnimations() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Generate random particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-blue-500/10 blur-xl"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size * 4,
                        height: particle.size * 4,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 50, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
}
