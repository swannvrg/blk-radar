"use client";

import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md">
      {/* Radar Loader Miniature */}
<div className="relative w-20 h-20">
  {/* Cercles concentriques (le fond du radar) */}
  <div className="absolute inset-0 border border-yellow-500/20 rounded-full"></div>
  <div className="absolute inset-4 border border-yellow-500/10 rounded-full"></div>
  
  {/* Lignes d'axes (croix de visée) */}
  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-500/10"></div>
  <div className="absolute left-1/2 top-0 w-[1px] h-full bg-yellow-500/10"></div>

  {/* Le faisceau rotatif (Sweep) */}
  <div 
    className="absolute inset-0 rounded-full"
    style={{
      background: 'conic-gradient(from 0deg at 50% 50%, rgba(255, 215, 0, 0.4) 0deg, transparent 90deg)',
      animation: 'radar-spin 2s linear infinite'
    }}
  ></div>

  {/* Point central (Le "Blip") */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_#FFD700]"></div>
  </div>
</div>
      
      {/* Texte avec effet de pulsation */}
      <h2 className="mt-6 text-yellow-500 font-black uppercase tracking-[0.3em] italic animate-pulse">
        BLK RADAR
      </h2>
      <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">
        Chargement en cours...
      </p>
    </div>
  );
};

export default LoadingScreen;