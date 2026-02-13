"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, Terminal, BarChart3 } from "lucide-react";

const audience = [
    {
        icon: Briefcase,
        title: "IT Operations Teams",
        desc: "Streamline service desk efficiency.",
    },
    {
        icon: Users,
        title: "Product & Engineering",
        desc: "Receive clear, prioritized technical tasks.",
    },
    {
        icon: Terminal,
        title: "Service Delivery Leaders",
        desc: "Monitor comprehensive performance metrics.",
    },
    {
        icon: BarChart3,
        title: "Technology Leaders",
        desc: "Ensure strategic alignment and tool consolidation.",
    },
];

export function TargetAudience() {
    return (
        <section className="bg-slate-50 py-20 sm:py-24">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="flex justify-center">
                        <div className="relative inline-flex items-center justify-center px-8 py-2">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 rounded-full border border-[#bcd6ff] bg-[#e6f0ff]"
                            />
                            <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#0065ff]">
                                WHO IT IS FOR
                            </span>
                        </div>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-[#111111] md:text-5xl">
                        Built for Enterprise Operations
                    </h2>
                </motion.div>

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {audience.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 font-display text-lg font-bold text-slate-900 group-hover:text-brand">
                                {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
