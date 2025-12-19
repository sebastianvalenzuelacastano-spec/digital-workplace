import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";

// Force dynamic rendering for Highlights component that reads from DB
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
    </main>
  );
}
