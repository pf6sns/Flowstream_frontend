 "use client";

import { motion } from "framer-motion";
import { Mail, Brain, Ticket, Code2, Rocket, CheckCircle, Send } from "lucide-react";

const steps = [
  {
    icon: Mail,
    label: "Issue raised",
    desc: "User reports an issue via email, Slack, or portal. No complex forms required.",
  },
  {
    icon: Brain,
    label: "AI analysis",
    desc: "OrchestrAI instantly classifies the intent, severity, and required expertise.",
  },
  {
    icon: Ticket,
    label: "Ticket creation",
    desc: "A fully populated incident is created in ServiceNow/Jira with correct routing.",
  },
  {
    icon: Code2,
    label: "Automated diagnosis",
    desc: "The system runs diagnostic scripts and suggests potential root causes.",
  },
  {
    icon: Rocket,
    label: "Remediation",
    desc: "Engineering approves AI-suggested fixes or implements code changes.",
  },
  {
    icon: CheckCircle,
    label: "Verification",
    desc: "Automated tests verify the fix in staging before deployment.",
  },
  {
    icon: Send,
    label: "Closure",
    desc: "Stakeholders are notified, and the ticket is closed with a complete audit trail.",
  },
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-gradient-to-b from-white to-brand-50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex rounded-full border border-brand/20 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Process roadmap
          </span>
          <h2 className="mt-5 font-semibold text-2xl text-text sm:text-3xl md:text-4xl">
            From chaos to order
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Follow the journey of a single incident as it moves through our autonomous orchestration
            layer.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-0 h-full w-[2px] rounded-full bg-gradient-to-b from-brand/10 via-brand/40 to-brand/10 md:left-1/2 md:-translate-x-1/2" />

          <div className="flex flex-col gap-12 sm:gap-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={`relative flex flex-col gap-8 md:flex-row md:items-center ${
                  i % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Card side */}
                <div className="group ml-16 flex-1 md:ml-0 md:w-1/2">
                  <div
                    className={`relative rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-400 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl ${
                      i % 2 !== 0 ? "md:text-left" : "md:text-right"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute -top-10 hidden select-none text-6xl font-black text-brand/10 md:block ${
                        i % 2 !== 0 ? "left-6" : "right-6"
                      }`}
                    >
                      0{i + 1}
                    </span>

                    <h3 className="relative z-10 text-base font-semibold text-text">
                      {step.label}
                    </h3>
                    <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-600">
                      {step.desc}
                    </p>

                    {/* Mobile step indicator */}
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand md:hidden">
                      <span className="h-px w-8 bg-brand/30" />
                      Step 0{i + 1}
                    </div>
                  </div>
                </div>

                {/* Central node */}
                <div className="absolute left-[28px] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-white bg-white shadow-md transition-transform duration-500 group-hover:scale-110 md:left-1/2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-400 text-white shadow-inner">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Spacer for opposite side on desktop */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

