"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import MapFilters from "../components/MapFilter";
import { useState, useCallback, useEffect } from "react";
import VerticalZoomSlider from "../components/VerticalZoomSlider";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import DemandeInterviewForm from "@/components/DemandeInterviewForm";
import { Filter, ChevronUp, ChevronDown } from "lucide-react"; // Ajout d'icônes

const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [map, setMap] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // État pour le toggle
  const [activeFilters, setActiveFilters] = useState({
    specialties: [] as string[],
    selectedItems: [] as any[],
    query: "",
    type: "ville",
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleFilter = useCallback((filters: any) => {
    setActiveFilters(filters);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const scrollToForm = () => {
      if (window.location.hash === "#form-talent") {
        const element = document.getElementById("form-talent");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    if (!isInitialLoading) {
      const timer = setTimeout(scrollToForm, 500);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="text-white bg-zinc-950 flex flex-col items-center overflow-x-hidden">
        <main className="flex flex-col lg:flex-row w-full h-full p-1 lg:p-2 gap-4 flex-1 lg:mt-2">
          {/* BOUTON TOGGLE (Visible uniquement < lg) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden flex items-center justify-between w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-1 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#FFD700]" />
              <span className="text-xs font-black uppercase tracking-widest">
                Filtres de recherche
              </span>
            </div>
            {isSidebarOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {/* ZONE GAUCHE : SIDEBAR (Animée sur mobile) */}
          <aside
            className={`
            w-full lg:w-1/4 bg-zinc-950 border border-zinc-800 rounded-3xl  flex flex-col 
            transition-all duration-500 ease-in-out max-[460px]:h-[325px] h-[200px] lg:h-[calc(90vh-80px)]
            ${isSidebarOpen ? "max-h-[600px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0 lg:max-h-[calc(90vh-80px)] lg:opacity-100"}
            lg:h-[calc(90vh-80px)]
          `}
          >
            <div className="flex-1 h-full min-h-0 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50 ">
              <div className="h-full ">
                <MapFilters onFilter={handleFilter} />
              </div>
            </div>
          </aside>

          {/* ZONE DROITE : CARTE + ZOOM */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 lg:h-[calc(90vh-80px)]">
            {/* CARTE : Elle prend le max d'espace */}
            <section className="flex-1 h-[450px] lg:h-full border border-zinc-800 rounded-3xl overflow-hidden relative bg-zinc-950">
              <MapComponent
                key="static-map"
                filters={activeFilters}
                setMap={setMap}
              />
            </section>

            {/* CONTENEUR ZOOM : Largeur pleine sur mobile, étroit sur desktop */}
            <div className="flex items-center w-full md:w-auto">
              <div
                className="
      /* Layout mobile : Horizontal et large */
      w-full h-12 px-6 flex flex-row items-center justify-between
      /* Layout Desktop (md+) : Vertical et fin */
      md:w-12 md:h-full md:px-1 md:flex-col md:justify-center
      /* Style commun */
      bg-zinc-900/20 rounded-2xl border border-white/5 
      bg-black/40 backdrop-blur-md
    "
              >
                <VerticalZoomSlider map={map} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <div id="form-talent" className="w-full shrink-0">
        <DemandeInterviewForm />
      </div>

      <Footer />
    </>
  );
}
