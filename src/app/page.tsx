
import RecipeGenerator from "@/components/recipe-generator";
import Image from "next/image";

export default function Home() {
  return (
    <div 
      className="relative min-h-[calc(100vh-57px)] flex items-center justify-center p-4 overflow-hidden"
    >
      <Image
        src="/images/background.jpg"
        alt="A vibrant arrangement of fresh vegetables and herbs on a rustic wooden surface."
        fill
        className="object-cover"
        data-ai-hint="food ingredients"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-5xl bg-black/40 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/10">
        <RecipeGenerator />
      </div>
    </div>
  );
}
