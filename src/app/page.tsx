"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import MapFilters from "../components/MapFilter";
import { useState, useCallback, useEffect } from "react";
import VerticalZoomSlider from "../components/VerticalZoomSlider";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import DemandeInterviewForm from "@/components/DemandeInterviewForm";

const MapComponent = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [map, setMap] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({
    specialties: [] as string[],
    selectedItems: [] as any[],
    query: "",
    type: "ville",
  });

  const handleFilter = useCallback((filters: any) => {
    setActiveFilters(filters);
  }, []);

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
    <>
      <div className="h-[calc(100vh-80px)]  text-white   overflow-y-auto  mx-auto p-4 bg-zinc-950  flex flex-col items-center">
        {/* 2. On fixe la hauteur du radar à 90vh (ou 100vh) pour qu'il soit imposant mais laisse la place au scroll */}
        <main className="flex w-full  p-4 gap-4 ">
          {/* ZONE GAUCHE : SIDEBAR */}
          <aside className="basis-1/4 h-full bg-zinc-950 border border-zinc-800 rounded-3xl flex p-3 overflow-hidden">
            <div className="flex w-full gap-1">
              <div className="flex-1 min-h-0 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-800/50 overflow-hidden">
                <div className="h-full min-h-0  pr-2 custom-scrollbar">
                  <MapFilters onFilter={handleFilter} />
                </div>
              </div>

              <div className="flex items-center pl-1">
                <div className="h-full bg-zinc-900/20 rounded-xl border border-white/5 py-4 px-1 text-center">
                  <VerticalZoomSlider map={map} />
                </div>
              </div>
            </div>
          </aside>

          {/* ZONE DROITE : CARTE */}
          <section className="flex-1 h-full border border-zinc-800 rounded-3xl overflow-hidden relative bg-zinc-950">
            <MapComponent
              key="static-map"
              filters={activeFilters}
              setMap={setMap}
            />
          </section>
        </main>
        </div>
        <div className="w-full shrink-0">
           <DemandeInterviewForm />
        </div>
        
      
      <Footer />
    </>
  );
}
