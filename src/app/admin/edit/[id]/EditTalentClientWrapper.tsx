"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditTalentForm from "@/components/admin/EditTalentForm";
import EditInfoPerso from "@/components/admin/EditInfoPerso";

export default function EditTalentClientWrapper({ talent }: { talent: any }) {
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  

  // Sécurité supplémentaire : si talent n'est pas là, on ne rend rien
  if (!talent) return null;

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto bg-zinc-950 text-white flex flex-col items-center p-4">      
    <div className="max-w-4xl w-full mx-auto">
        
        <Link 
          href={`/talents/${talent.id}`} 
          className="inline-flex items-center text-yellow-500 hover:text-white transition-colors mb-8 font-bold uppercase tracking-tighter"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Retour au profil
        </Link>

        <div className="flex flex-row items-end justify-between mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tighter">
            MODIFIER : <span className="text-yellow-500 uppercase">{talent.first_name} {talent.last_name}</span>
          </h1>

          <button 
            onClick={() => setShowPersonalInfo(!showPersonalInfo)}
            className="flex items-center gap-2 text-zinc-500 hover:text-yellow-500 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {showPersonalInfo ? "Fermer l'édition" : "Éditer les infos persos"}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${showPersonalInfo ? 'rotate-45 text-yellow-500' : 'group-hover:scale-110'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>

        {showPersonalInfo ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
             <EditInfoPerso 
                talent={talent} 
                onClose={() => setShowPersonalInfo(false)} 
             />
          </div>
        ) : (
          <EditTalentForm talent={talent} />
        )}
      </div>
    </div>
  );
}