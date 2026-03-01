"use client";

import React, { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Footer from "@/components/Footer";
import InterviewList from "@/components/InterviewList";
import Navbar from "@/components/Navbar";
import DemandeInterviewForm from "@/components/DemandeInterviewForm";

export default function InterviewsPage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      
      {/* Conteneur de scroll unique qui s'arrête sous la nav */}
      <div className="mt-[80px] flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* HEADER DE PAGE */}
        <header className="relative py-20 px-6 flex flex-col items-center justify-center overflow-hidden border-b border-zinc-900">
          {/* EFFET RADAR SUBTIL */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-500/20 rounded-full animate-pulse" />
          </div>

          <div className="relative z-10 text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              NOS <span className="text-yellow-500 italic text-shadow-glow">INTERVIEWS</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
              Le futur s'exprime ici 
            </p>
          </div>
        </header>

        {/* LISTE DES INTERVIEWS */}
        <main className="py-12">
          <InterviewList />
        </main>
        <DemandeInterviewForm />
        <Footer />
      </div>
    </div>
  );
}