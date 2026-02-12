import { LandingNavbar } from "@/components/landingpage/Navbar";
import { Hero } from "@/components/landingpage/Hero";
import { PainPoints } from "@/components/landingpage/PainPoints";
import { Solution } from "@/components/landingpage/Solution";
import Benefits from "@/components/landingpage/Benefits";
import { Workflow } from "@/components/landingpage/Workflow";
import { Enterprise } from "@/components/landingpage/Enterprise";
import { FinalCTA } from "@/components/landingpage/FinalCTA";
import { Footer } from "@/components/landingpage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main className="pt-16">
        <Hero />
        <PainPoints />
        <Solution />
        <Benefits />
        <Workflow />
        <Enterprise />
        <FinalCTA />
      </main>
    </div>
  );
}
