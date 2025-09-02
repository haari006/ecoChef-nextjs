import RecipeGenerator from "@/components/recipe-generator";

export default function Home() {
  return (
    <div 
      className="relative min-h-[calc(100vh-57px)] flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: "url(/background.jpg)"}}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 w-full">
        <RecipeGenerator />
      </div>
    </div>
  );
}
