"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, User, X, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useRef } from "react";

interface MapFiltersProps {
  onFilter: (filters: {
    specialties: string[];
    selectedItems: any[];
    type: string;
  }) => void;
}

export default function MapFilters({ onFilter }: MapFiltersProps) {
  // États globaux
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]); // Tableau de tags (villes ou noms)
  const [searchType, setSearchType] = useState("ville");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rangeValue, setRangeValue] = useState(20);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: "mode", label: "Mode / Design" },
    { id: "sport", label: "Sport / Fitness" },
    { id: "musique", label: "Musique / Art" },
    { id: "media", label: "Média / Influence" },
    { id: "tech", label: "Tech / Digital" },
    { id: "entrepreneuriat", label: "Entrepreneuriat" },
  ];

  // --- LOGIQUE FILTRES ---
  useEffect(() => {
    onFilter({ specialties: selectedSpecs, selectedItems, type: searchType });
  }, [selectedSpecs, selectedItems, searchType, onFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si la ref existe et que le clic n'est PAS dans l'élément pointé par la ref
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsRangeOpen(false);
      }
    };

    // On attache l'événement
    document.addEventListener("mousedown", handleClickOutside);

    // On nettoie l'événement quand le composant est détruit
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRangeOpen]); // On ré-exécute si l'état change

  // --- LOGIQUE SUGGESTIONS ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length <= 2) {
        setSuggestions([]);
        return;
      }

      try {
        if (searchType === "ville") {
          // --- API ADRESSE ---
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
              // IMPORTANT : On garde les coordonnées pour le calcul de distance
              coords: f.geometry.coordinates,
              image: null,
            })),
          );
        } else {
          // --- RECHERCHE TALENTS ---
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
              type: "personne", // Bien spécifier le type ici
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
    <div className="flex flex-col h-full min-h-0 pr-2">
      {/* SÉLECTEUR DE SPÉCIALITÉ MULTIPLE */}

      <div className="w-full pb-6">
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
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase  mb-2 block">
          Type de Recherche
        </label>
        <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              setSearchType("ville");
              setQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black transition-all ${searchType === "ville" ? "bg-[#FFD700] text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
          >
            <MapPin size={12} /> VILLE
          </button>
          <button
            onClick={() => {
              setSearchType("personne");
              setQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black transition-all ${searchType === "personne" ? "bg-[#FFD700] text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
          >
            <User size={12} /> NOM
          </button>
        </div>
      </div>

      {/* BARRE DE RECHERCHE DYNAMIQUE */}
      <div className="flex-1  flex flex-col pt-2">
        <div className="flex gap-2 mb-3 relative z-[50]">
          {/* CHAMP DE RECHERCHE */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === "ville"
                  ? "Ajouter une ville..."
                  : "Ajouter un nom..."
              }
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 pl-10 text-xs text-white focus:border-[#FFD700] outline-none transition-all placeholder:text-zinc-700 font-medium"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
              size={16}
            />
          </div>

          {/* BOUTON RANGE  */}
          {searchType === "ville" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRangeOpen(!isRangeOpen)}
                className="h-full flex items-center gap-2 bg-black border border-zinc-800 px-3 rounded-xl text-[#FFD700] text-[10px] font-black hover:border-[#FFD700] transition-all whitespace-nowrap"
              >
                {rangeValue} KM
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isRangeOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* DROPDOWN DU SLIDER */}
              {isRangeOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-1 w-48 bg-black border border-zinc-800 rounded-xl p-3 z-[150] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <div className="flex justify-between mb-3 items-center">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                      Périmètre
                    </span>
                    <span className="text-[10px] font-black text-[#FFD700] drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">
                      {rangeValue} KM
                    </span>
                  </div>

                  {/* CONTAINER DU SLIDER CUSTOM */}
                  <div className="relative h-4 flex items-center">
                    {/* Fond du slider */}
                    <div className="absolute w-full h-1 bg-zinc-900 rounded-full border border-white/5 overflow-hidden">
                      {/* Barre de progression jaune (Zéro délai : transition supprimée) */}
                      <div
                        className="h-full bg-[#FFD700] shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                        style={{
                          width: `${((rangeValue - 5) / (200 - 5)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* GRADUATIONS (Ticks) */}
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

                    {/* INPUT RANGE INVISIBLE */}
                    <input
                      type="range"
                      min="0" // Garde 0 pour la logique interne
                      max="200"
                      step="5"
                      value={rangeValue}
                      onChange={(e) => setRangeValue(parseInt(e.target.value))}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                    />

                    {/* CURSEUR VISUEL (La boule - Transition supprimée pour coller à la souris) */}
                    <div
                      className="absolute w-3.5 h-3.5 bg-white border-2 border-[#FFD700] rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)] pointer-events-none z-20"
                      style={{
                        left: `calc(${((rangeValue - 5) / (200 - 5)) * 100}% - 7px)`,
                      }}
                    />
                  </div>

                  {/* Légende rapide */}
                  <div className="flex justify-between mt-1.5 px-0.5">
                    <span className="text-[7px] font-bold text-zinc-800 uppercase">
                      5km
                    </span>
                    <span className="text-[7px] font-bold text-zinc-800 uppercase">
                      200km
                    </span>
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
                            <User size={16} className="text-yellow-500/50" />
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
        <div className="relative flex-1 min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar pr-1 flex flex-wrap content-start gap-2">
            {selectedItems.map((item) => (
              <div
                key={item.value}
                className={`flex items-center gap-2 border text-[10px] font-bold uppercase tracking-wider pl-2 pr-1.5 py-1 rounded-lg animate-in fade-in zoom-in duration-200 
          ${
            item.type === "ville"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
          }`}
              >
                {/* Icône dynamique selon le type */}
                {item.type === "ville" ? (
                  <MapPin size={12} className="flex-shrink-0" />
                ) : (
                  <User size={12} className="flex-shrink-0" />
                )}

                <span className="mt-0.5 whitespace-nowrap">
                  {item.display}
                  {item.type === "ville" && (
                    <span className="opacity-50 ml-1 italic lowercase font-medium">
                      ({item.range}km)
                    </span>
                  )}
                </span>

                {/* Bouton de suppression */}
                <button
                  onClick={() => removeItem(item.value)}
                  className="hover:bg-white/10 rounded-md p-0.5 transition-colors ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {/* Gradient de fondu au scroll */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
