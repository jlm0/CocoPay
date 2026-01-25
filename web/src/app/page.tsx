import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Features } from "@/components/Features";
import { ChaosStrip } from "@/components/ChaosStrip";
import { HowItWorks } from "@/components/HowItWorks";
import { SocialProof } from "@/components/SocialProof";
import { Testimonial } from "@/components/Testimonial";
import { FooterCTA } from "@/components/FooterCTA";

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <Marquee />
      <Features />
      <ChaosStrip />
      <HowItWorks />
      <SocialProof />
      <Testimonial />
      <FooterCTA />
    </>
  );
}
