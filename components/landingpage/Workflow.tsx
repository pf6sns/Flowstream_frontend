"use client";

import { motion } from "framer-motion";
import { Mail, Brain, Ticket, Code2, Rocket, CheckCircle, Send } from "lucide-react";

const steps = [
  { icon: Mail, label: "Issue Raised", desc: "Issue comes in via email, Slack, or portal." },
  { icon: Brain, label: "AI Analysis", desc: "Flowstream instantly classifies the intent, severity, and required expertise." },
  { icon: Ticket, label: "Ticket Creation", desc: "A fully populated incident is created in ServiceNow/Jira with correct routing." },
  { icon: Code2, label: "Automated Diagnosis", desc: "The system runs diagnostic scripts and suggests potential root causes." },
  { icon: Rocket, label: "Remediation", desc: "Engineering approves AI-suggested fixes or implements code changes." },
  { icon: CheckCircle, label: "Verification", desc: "Automated tests verify the fix in staging before deployment." },
  { icon: Send, label: "Closure", desc: "Stakeholders are notified, and the ticket is closed with a complete audit trail." },
];

// Named export so app/page.tsx can import { Workflow } from "@/components/landingpage/Workflow";
export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-gradient-to-b from-white to-[#e6f0ff] py-20 sm:py-24"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 text-center"
        >
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center px-8 py-2">
              {/* Decorative capsule background, not a button */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border border-[#bcd6ff] bg-[#e6f0ff]"
              />
              <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#0065ff]">
                PROCESS ROADMAP
              </span>
            </div>
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-[#111111] md:text-5xl">
            From Chaos to Order
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Follow the journey of a single incident as it moves through our autonomous orchestration
            layer.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-5xl">
          {/* Vertical central line - Desktop */}
          <div className="absolute left-[30px] top-0 h-full w-px bg-slate-200 md:left-1/2 md:-translate-x-1/2" />

          <div className="flex flex-col gap-10 md:gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative flex flex-col gap-4 md:flex-row md:items-center ${i % 2 !== 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                {/* Content Card Side */}
                <div className="ml-20 flex-1 md:ml-0 md:w-1/2">
                  {/* Step number overlapping the card content */}
                  <span
                    className={`hidden md:block mt-2 text-6xl opacity-20 transition-opacity duration-300 group-hover:opacity-60 font-bold text-[#0065ff]/70 ${i % 2 !== 0 ? "text-left" : "text-right"
                      }`}
                  >
                    0{i + 1}
                  </span>

                  <div
                    className={`relative z-10 rounded-xl border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 ${i % 2 !== 0 ? "md:text-left" : "md:text-right"
                      }`}
                  >
                    <h3 className="mb-2 font-display text-lg font-bold text-[#111111]">
                      {step.label}
                    </h3>
                    <p className="text-sm leading-snug text-gray-600">{step.desc}</p>

                    {/* Mobile Only: Step indicator inside card */}
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0065ff] md:hidden">
                      <span className="h-px w-6 bg-brand/30" />
                      Step 0{i + 1}
                    </div>
                  </div>
                </div>

                {/* Central Node */}
                <div className="absolute left-[30px] z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-[#0065ff] shadow-sm md:left-1/2">
                  <step.icon className="h-4 w-4 text-white" />
                </div>

                {/* Empty Space for the other side */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
