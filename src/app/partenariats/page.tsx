"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import PartenariatForm from "@/components/PartenariatForm";

export default function PartenariatsPage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      
      {/* Conteneur de scroll unique calé sous la Nav */}
      <main className=" flex-1 overflow-y-auto custom-scrollbar">
        

        {/* Le formulaire que nous venons de créer */}
        <PartenariatForm />

        <Footer />
      </main>
    </div>
  );
}