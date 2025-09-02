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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full">
        <RecipeGenerator />
      </div>
    </div>
  );
}
