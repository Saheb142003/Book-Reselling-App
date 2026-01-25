import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-main flex flex-col">
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
