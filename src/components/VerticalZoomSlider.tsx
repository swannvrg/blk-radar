import React, { useEffect, useState } from "react";

interface VerticalZoomSliderProps {
  map: L.Map | null;
}

const VerticalZoomSlider: React.FC<VerticalZoomSliderProps> = ({ map }) => {
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isMobile, setIsMobile] = useState(false);
  
  const min = 0;
  const max = 18;
  const percentage = (zoomLevel / max) * 100;
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);

  useEffect(() => {
    // Détecter le passage sous md (768px)
    const checkRes = () => setIsMobile(window.innerWidth < 768);
    checkRes();
    window.addEventListener('resize', checkRes);

    if (!map) return;
    const syncZoom = () => setZoomLevel(Math.round(map.getZoom()));
    map.on("zoomend", syncZoom);
    
    return () => {
      window.removeEventListener('resize', checkRes);
      map.off("zoomend", syncZoom);
    };
  }, [map]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setZoomLevel(val);
    map?.setZoom(val);
  };

  const handleZoomIn = () => {
    if (zoomLevel < max) {
      const newZoom = zoomLevel + 1;
      setZoomLevel(newZoom);
      map?.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > min) {
      const newZoom = zoomLevel - 1;
      setZoomLevel(newZoom);
      map?.setZoom(newZoom);
    }
  };

  return (
    <div className="relative h-full w-full md:w-12 flex flex-row md:flex-col items-center group p-2 md:py-4">
      
      {/* BOUTON ZOOM - (Placé en premier sur mobile pour être à gauche) */}
      <button 
        onClick={handleZoomOut}
        className="order-1 md:order-last transition-all duration-300 hover:scale-125 active:scale-90 z-30 mr-4 md:mr-0 md:mt-4"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 hover:text-yellow-500 transition-colors">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
        </svg>
      </button>

      {/* TRACKER */}
      <div className="relative flex-1 h-2 md:h-full w-full md:w-2 bg-zinc-900/80 rounded-full border border-white/5 shadow-inner order-2">
        
        {/* GRADUATIONS */}
        <div className="absolute inset-0 flex flex-row md:flex-col-reverse justify-between px-[2px] md:px-0 md:py-[2px] pointer-events-none">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`h-full md:h-[1px] w-[1px] md:w-full transition-colors duration-300 ${tick <= zoomLevel ? "bg-yellow-500/40" : "bg-zinc-700/50"}`}
            />
          ))}
        </div>

        {/* Barre de remplissage jaune */}
        <div
          className="absolute bottom-0 left-0 bg-yellow-500 transition-all duration-200 ease-out shadow-[0_0_15px_rgba(234,179,8,0.3)] rounded-full"
          style={{ 
            height: isMobile ? '100%' : `${percentage}%`,
            width: isMobile ? `${percentage}%` : '100%'
          }}
        />

        {/* Curseur rond */}
        <div
          className="absolute bg-white border-2 border-yellow-500 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.6)] pointer-events-none z-10 transition-all duration-200 ease-out w-4 h-4"
          style={{
            left: isMobile ? `${percentage}%` : '50%',
            bottom: isMobile ? '50%' : `${percentage}%`,
            transform: "translate(-50%, 50%)",
          }}
        />

        {/* Input invisible pour le contrôle */}
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={zoomLevel}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{
            writingMode: isMobile ? "horizontal-tb" : "vertical-lr",
            WebkitAppearance: isMobile ? "none" : "slider-vertical",
          }}
        />
      </div>

      {/* BOUTON ZOOM + */}
      <button 
        onClick={handleZoomIn}
        className="order-3 md:order-first transition-all duration-300 hover:scale-125 active:scale-90 z-30 ml-4 md:ml-0 md:mb-4"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 hover:text-yellow-500 transition-colors">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" /><line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};

export default VerticalZoomSlider;