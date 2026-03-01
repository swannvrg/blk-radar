"use client";
import AboutMedia from "@/components/AboutMedia";
import { Radar } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen"; // Import du composant
import Footer from "@/components/Footer";
import DemandeInterviewForm from "@/components/DemandeInterviewForm";


export default function InfosPage() {

  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Chargement à l'entrée : On simule un petit délai pour l'effet visuel BLK 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800); // Un délai court pour une entrée fluide
    return () => clearTimeout(timer);
  }, []);


  // Affichage du loader à l'entrée de la page
  if (isInitialLoading) {
    return <LoadingScreen />;
  }
  return (
    <>
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden bg-zinc-950">
      
      {/* EFFET RADAR EN FOND */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-yellow-500/10 rounded-full animate-[ping_5s_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-yellow-500/20 rounded-full animate-[ping_3s_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[400px] bg-gradient-to-t from-yellow-500/50 to-transparent origin-bottom animate-[spin_4s_linear_infinite]" />
      </div>

      {/* COMPOSANT */}
      <div className="relative z-10 w-full flex flex-col items-center gap-8">
        <AboutMedia isPage={true} />
        
        {/* Petit lien de retour rapide */}
        <a 
          href="/" 
          className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-[#EAB308] transition-colors"
        >
          ← Back to Radar
        </a>
      </div>
    </main>
    <div className="w-full shrink-0">
               <DemandeInterviewForm />
            </div>
    <Footer />
    </>
  );
}