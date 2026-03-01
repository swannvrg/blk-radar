"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddTalentForm from "../../../components/admin/AddTalentForm";
import LoadingScreen from "@/components/LoadingScreen"; // Import du composant

const AddTalentPage = () => {
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Chargement à l'entrée : On simule un petit délai pour l'effet visuel BLK 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800); // Un délai court pour une entrée fluide
    return () => clearTimeout(timer);
  }, []);

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  const handleClose = () => {
    router.push("/");
  };

  // Affichage du loader à l'entrée de la page
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    
    <div className="h-[calc(100vh-80px)] overflow-y-auto  mx-auto p-4 bg-zinc-950 text-yellow-500 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-widest">
          Ajouter un Nouveau Talent
        </h1>
        
        <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl border border-yellow-500/30">
          <AddTalentForm 
            onSuccess={handleSuccess} 
            onClose={handleClose} 
          />
          
        </div>
      </div>
    </div>
  );
};

export default AddTalentPage;