"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlayCircle, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Talent {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  interview_url: string;
  image_url: string;
}

export default function InterviewList() {
  const [allInterviews, setAllInterviews] = useState<Talent[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Talent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("TOUT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      const { data, error } = await supabase
        .from("talents")
        .select("id, first_name, last_name, specialty, interview_url, image_url")
        .not("interview_url", "is", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAllInterviews(data);
        setFilteredInterviews(data);
        
        // Extraction des catégories uniques pour le filtre
        const uniqueCats = Array.from(new Set(data.map(t => t.specialty.toUpperCase())));
        setCategories(["TOUT", ...uniqueCats]);
      }
      setLoading(false);
    };
    fetchInterviews();
  }, []);

  // Logique de filtrage
  useEffect(() => {
    if (activeCategory === "TOUT") {
      setFilteredInterviews(allInterviews);
    } else {
      setFilteredInterviews(allInterviews.filter(t => t.specialty.toUpperCase() === activeCategory));
    }
  }, [activeCategory, allInterviews]);

  if (loading) return <div className="text-zinc-500 font-black animate-pulse text-center py-20 uppercase text-[10px] tracking-[0.3em]">Initialisation du Radar...</div>;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12">
      {/* HEADER AVEC TITRE */}
      <div className="mb-4 flex items-end gap-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
          Dernières <span className="text-yellow-500 italic">Interviews.</span>
        </h2>
        <div className="h-px flex-1 bg-zinc-800 mb-2"></div>
      </div>

      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
              activeCategory === cat 
                ? "bg-yellow-500 border-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRILLE DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInterviews.map((talent) => (
          <div key={talent.id} className="relative group">
            {/* Lien principal sur toute la carte */}
            <a 
              target="_blank"
              rel="noopener noreferrer"
              href={talent.interview_url} 
              className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 flex gap-4 items-center"
            >
              {/* Image Mini */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
                <img 
                  src={talent.image_url || "/placeholder-blk.jpg"} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  alt={talent.first_name}
                />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                  {talent.specialty}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">
                  {talent.first_name} {talent.last_name}
                </h3>
                
                {/* Liens d'action */}
                <div className="flex gap-3 mt-2 pointer-events-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase group-hover:text-yellow-500 transition-colors">
                    <PlayCircle size={14} /> Regarder
                  </div>
                  
                  {/* On utilise un composant Link séparé pour le profil sans casser le lien parent <a> */}
                  <Link 
                    href={`/talents/${talent.id}`}
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase border-l border-zinc-800 pl-3"
                  >
                    <User size={14} /> Profil
                  </Link>
                </div>
              </div>

              <ArrowUpRight className="text-zinc-800 group-hover:text-yellow-500 transition-colors shrink-0" size={20} />
            </a>
          </div>
        ))}
      </div>

      {/* État vide */}
      {filteredInterviews.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
          <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Aucune interview dans cette catégorie pour le moment.</p>
        </div>
      )}
    </section>
  );
}