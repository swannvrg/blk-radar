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
  const router = useRouter();
  const [map, setMap] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({
    specialties: [] as string[],
    selectedItems: [] as any[],
    query: "",
    type: "ville",
  });

  // On centralise le chargement sur un seul état pour éviter les conflits
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleFilter = useCallback((filters: any) => {
    setActiveFilters(filters);
  }, []);

  // --- TOUS LES HOOKS DOIVENT ÊTRE ICI, TOUT EN HAUT ---

  // 1. Gestion du délai de chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 2. Gestion du scroll automatique vers l'interview
  useEffect(() => {
    const scrollToForm = () => {
      if (window.location.hash === "#form-talent") {
        const element = document.getElementById("form-talent");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // On déclenche le scroll seulement quand le loader disparait
    if (!isInitialLoading) {
      const timer = setTimeout(scrollToForm, 500);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  // --- LES CONDITIONS DE RENDU (IF) DOIVENT VENIR APRÈS LES HOOKS ---

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // Fonctions utilitaires
  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <>
      <div className="h-[calc(100vh-80px)] text-white overflow-y-auto mx-auto p-4 bg-zinc-950 flex flex-col items-center">
        <main className="flex w-full p-4 gap-4 ">
          {/* ZONE GAUCHE : SIDEBAR */}
          <aside className="basis-1/4 h-full bg-zinc-950 border border-zinc-800 rounded-3xl flex p-3 overflow-hidden">
            <div className="flex w-full gap-1">
              <div className="flex-1 min-h-0 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-800/50 overflow-hidden">
                <div className="h-full min-h-0 pr-2 custom-scrollbar">
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