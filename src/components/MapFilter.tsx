"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, User, X, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface MapFiltersProps {
  onFilter: (filters: {
    specialties: string[];
    selectedItems: any[];
    type: string;
  }) => void;
}

export default function MapFilters({ onFilter }: MapFiltersProps) {
  // --- ÉTATS ---
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchType, setSearchType] = useState("ville");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rangeValue, setRangeValue] = useState(20);
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  // --- REFS POUR CLIC EXTÉRIEUR ---
  const specDropdownRef = useRef<HTMLDivElement>(null);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: "mode", label: "Mode / Design" },
    { id: "sport", label: "Sport / Fitness" },
    { id: "musique", label: "Musique / Art" },
    { id: "media", label: "Média / Influence" },
    { id: "tech", label: "Tech / Digital" },
    { id: "entrepreneuriat", label: "Entrepreneuriat" },
  ];

  // --- LOGIQUE FERMETURE CLIC EXTÉRIEUR ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Fermer le menu KM si on clique ailleurs que sur le bouton ou le menu
      if (
        isRangeOpen &&
        rangeDropdownRef.current &&
        !rangeDropdownRef.current.contains(target)
      ) {
        setIsRangeOpen(false);
      }

      // Fermer le menu Spécialités si on clique ailleurs
      if (
        isDropdownOpen &&
        specDropdownRef.current &&
        !specDropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRangeOpen, isDropdownOpen]);

  // --- LOGIQUE FILTRES ---
  useEffect(() => {
    onFilter({ specialties: selectedSpecs, selectedItems, type: searchType });
  }, [selectedSpecs, selectedItems, searchType, onFilter]);

  // --- LOGIQUE SUGGESTIONS ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length <= 2) {
        setSuggestions([]);
        return;
      }

      try {
        if (searchType === "ville") {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=20`,
          );
          const data = await res.json();

          setSuggestions(
            data.features.map((f: any) => ({
              display: f.properties.city,
              value: f.properties.city,
              sub: f.properties.postcode,
              type: "ville",
              coords: f.geometry.coordinates,
              image: null,
            })),
          );
        } else {
          const { data, error } = await supabase
            .from("talents")
            .select("first_name, last_name, city, image_url")
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
            .order("first_name", { ascending: true })
            .limit(20);

          if (error) throw error;

          setSuggestions(
            data.map((t: any) => ({
              display: `${t.first_name} ${t.last_name}`,
              value: `${t.first_name} ${t.last_name}`,
              sub: t.city,
              type: "personne",
              image: t.image_url,
            })),
          );
        }
      } catch (err) {
        console.error("Erreur suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [query, searchType]);

  // --- ACTIONS ---
  const toggleSpec = (id: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const addItem = (item: any) => {
    if (!selectedItems.find((i) => i.value === item.value)) {
      const newItem = {
        ...item,
        range: item.type === "ville" ? rangeValue : null,
        coords: item.coords || null,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    setQuery("");
    setSuggestions([]);
  };

  const removeItem = (value: string) => {
    setSelectedItems(selectedItems.filter((i) => i.value !== value));
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-zinc-950/50 p-2">
      <div className="flex-1 overflow-y-auto  custom-scrollbar pr-2 space-y-6">
        {/* SÉLECTEUR DE SPÉCIALITÉ MULTIPLE */}
        <div className="flex flex-col min-[460px]:flex-row lg:flex-col gap-4 w-full">
          <div className="w-full ">
            <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] mb-2 block">
              Type de Spécialité
            </label>

            <div className="relative z-[100]  ">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`min-h-[48px] w-full bg-black border ${isDropdownOpen ? "border-[#FFD700]" : "border-zinc-800"} 
            rounded-xl p-1.5 pr-10 flex flex-wrap gap-1.5 cursor-pointer transition-all duration-300 shadow-inner`}
              >
                {selectedSpecs.length === 0 && (
                  <span className="text-zinc-500 text-xs self-center ml-2">
                    Toutes les catégories
                  </span>
                )}

                {selectedSpecs.map((specId) => {
                  const label = options.find((o) => o.id === specId)?.label;
                  return (
                    <div
                      key={specId}
                      className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 text-white text-[11px] pl-2.5 pr-1.5 py-1 rounded-lg animate-in fade-in zoom-in duration-200"
                    >
                      <span>{label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSpec(specId);
                        }}
                        className="hover:text-[#FFD700] transition-colors"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}

                <ChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-[#FFD700]" : "text-zinc-500"}`}
                  size={16}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute w-full mt-1 bg-black border border-zinc-800 rounded-xl overflow-hidden z-[110] shadow-2xl animate-in slide-in-from-top-2 duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => toggleSpec(opt.id)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 cursor-pointer transition-colors border-b border-zinc-900/50 last:border-0"
                      >
                        <span
                          className={`text-xs ${selectedSpecs.includes(opt.id) ? "text-[#FFD700]" : "text-zinc-400"}`}
                        >
                          {opt.label}
                        </span>
                        {selectedSpecs.includes(opt.id) && (
                          <div className="w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TOGGLE TYPE DE RECHERCHE */}
          <div className="w-full">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">
              Type de Recherche
            </label>
            <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  setSearchType("ville");
                  setQuery("");
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-black transition-all ${searchType === "ville" ? "bg-[#FFD700] text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
              >
                <MapPin size={12} />
                VILLE
              </button>
              <button
                onClick={() => {
                  setSearchType("personne");
                  setQuery("");
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-black transition-all ${searchType === "personne" ? "bg-[#FFD700] text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
              >
                <User size={12} /> NOM
              </button>
            </div>

            {/* BARRE DE RECHERCHE ET KM - TOUJOURS EN LIGNE */}
            <div className="w-full relative z-[50] pt-1">
              {/* Suppression du flex-col : on reste en row tout le temps */}
              <div className="flex flex-row gap-2 mb-3 relative z-[50] h-[46px]">
                <div className="relative flex-1 h-full">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      searchType === "ville"
                        ? "Ajouter une ville..."
                        : "Ajouter un nom..."
                    }
                    className="w-full h-full bg-black border border-zinc-800 rounded-xl p-3 pl-10 text-xs text-white focus:border-[#FFD700] outline-none transition-all placeholder:text-zinc-700 font-medium"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
                    size={16}
                  />
                </div>

                {/* BOUTON RANGE (KM) */}
                {searchType === "ville" && (
                  <div className="relative h-full" ref={rangeDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsRangeOpen(!isRangeOpen)}
                      className="
            /* STYLE DE BASE : Toujours en ligne avec l'input */
            flex items-center justify-center
            bg-black border border-zinc-800 rounded-xl text-[#FFD700] 
            hover:border-[#FFD700] transition-all leading-none h-full

            /* MOBILE (< 1081px) : Compact et Vertical interne */
            flex-col w-[50px] p-0 gap-0
            
            /* DESKTOP (>= 1081px) : Horizontal et plus large */
            min-[1081px]:flex-row min-[1081px]:w-auto min-[1081px]:px-4 min-[1081px]:gap-2
          "
                    >
                      {/* CHIFFRE */}
                      <span className="text-[11px] min-[1081px]:text-[12px] font-black">
                        {rangeValue}
                      </span>

                      {/* KM */}
                      <span className="text-[7px] min-[1081px]:text-[10px] font-bold text-zinc-500 min-[1081px]:text-[#FFD700]">
                        KM
                      </span>

                      {/* FLECHE : Uniquement visible à partir de 1081px */}
                      <ChevronDown
                        size={12}
                        className={`hidden min-[1081px]:block transition-transform duration-300 ${isRangeOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isRangeOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-zinc-800 rounded-xl p-3 z-[150] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex justify-between mb-3 items-center">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            Périmètre
                          </span>
                        </div>

                        <div className="relative h-4 flex items-center">
                          <div className="absolute w-full h-1 bg-zinc-900 rounded-full border border-white/5 overflow-hidden">
                            <div
                              className="h-full bg-[#FFD700] shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                              style={{
                                width: `${((rangeValue - 5) / (200 - 5)) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="absolute inset-0 flex justify-between items-center px-0.5 pointer-events-none">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-[1px] h-1.5 transition-colors duration-200 ${
                                  (i / 9) * 195 + 5 <= rangeValue
                                    ? "bg-[#FFD700]/60"
                                    : "bg-zinc-800"
                                }`}
                              />
                            ))}
                          </div>

                          <input
                            type="range"
                            min="5"
                            max="200"
                            step="5"
                            value={rangeValue}
                            onChange={(e) =>
                              setRangeValue(parseInt(e.target.value))
                            }
                            className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                          />

                          <div
                            className="absolute w-3.5 h-3.5 bg-white border-2 border-[#FFD700] rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)] pointer-events-none z-20"
                            style={{
                              left: `calc(${((rangeValue - 5) / (200 - 5)) * 100}% - 7px)`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LISTE DES SUGGESTIONS (S'affiche sous l'input grâce au parent relatif) */}
                {suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 w-full mt-1 bg-black border border-zinc-800 rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          onClick={() => addItem(s)}
                          className={`flex items-center hover:bg-zinc-900 cursor-pointer border-b border-zinc-800/50 last:border-0 group transition-colors ${s.type === "personne" ? "p-3 gap-3" : "px-4 py-2 flex-col items-start"}`}
                        >
                          {s.type === "personne" ? (
                            <>
                              <div className="w-10 h-10 rounded-full border border-zinc-800 overflow-hidden flex-shrink-0 bg-zinc-900 flex items-center justify-center group-hover:border-[#FFD700] transition-colors">
                                {s.image ? (
                                  <img
                                    src={s.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User
                                    size={16}
                                    className="text-yellow-500/50"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="text-sm font-black text-white uppercase group-hover:text-[#FFD700] transition-colors leading-none mb-1">
                                  {s.display}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                  {s.sub}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-start text-left w-full ">
                              <span className="text-[11px] font-black text-white uppercase group-hover:text-[#FFD700] leading-tight text-left">
                                {s.display}
                              </span>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 text-left">
                                {s.sub}
                              </span>
                            </div>
                          )}
                        </li>
                      ))}
                    </div>
                  </ul>
                )}
              </div>
              {/* AFFICHAGE DES TAGS DE RECHERCHE SELECTIONNÉS (Couleurs et Icônes) */}
              <div className="w-full pt-2">
                <div className="flex flex-wrap gap-2 w-full">
                  {selectedItems.map((item) => (
                    <div
                      key={item.value}
                      className={`flex items-center gap-2 border text-[10px] font-bold uppercase tracking-wider pl-2 pr-1.5 py-1 rounded-lg max-w-full ${
                        item.type === "ville"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                      }`}
                    >
                      {item.type === "ville" ? (
                        <MapPin size={12} />
                      ) : (
                        <User size={12} />
                      )}

                      {/* truncate + whitespace-normal pour gérer les textes longs */}
                      <span className="truncate max-w-[120px] lg:max-w-[150px]">
                        {item.display}
                      </span>

                      <button
                        onClick={() => removeItem(item.value)}
                        className="ml-auto"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
