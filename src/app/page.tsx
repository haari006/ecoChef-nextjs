
'use client';

import RecipeGenerator from "@/components/recipe-generator";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();
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
      <div className="relative z-10 w-full max-w-5xl">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/10 mb-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            {t('generator.title')}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {t('generator.subtitle')}
          </p>
        </div>
        <RecipeGenerator />
      </div>
    </div>
  );
}
