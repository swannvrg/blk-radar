import React, { useEffect, useState } from "react";

interface VerticalZoomSliderProps {
  map: L.Map | null;
}

const VerticalZoomSlider: React.FC<VerticalZoomSliderProps> = ({ map }) => {
  const [zoomLevel, setZoomLevel] = useState(5);
  const min = 0;
  const max = 18;
  const percentage = (zoomLevel / max) * 100;

  const ticks = Array.from({ length: max + 1 }, (_, i) => i);

  useEffect(() => {
    if (!map) return;
    const syncZoom = () => setZoomLevel(Math.round(map.getZoom()));
    map.on("zoomend", syncZoom);
    return () => {
      map.off("zoomend", syncZoom);
    };
  }, [map]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setZoomLevel(val);
    map?.setZoom(val);
  };

  // FONCTIONS DE ZOOM PAS À PAS
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
    <div className="relative h-full w-12 flex flex-col items-center group py-4">
      {/* BOUTON ZOOM + */}
      <button 
        onClick={handleZoomIn}
        className="mb-4 transition-all duration-300 hover:scale-125 active:scale-90 z-30"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600 hover:text-yellow-500 transition-colors"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" />
          <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
        </svg>
      </button>

      <div className="relative flex-1 w-2 bg-zinc-900/80 rounded-full border border-white/5 shadow-inner">
        {/* GRADUATIONS */}
        <div className="absolute inset-0 flex flex-col-reverse justify-between py-[2px] pointer-events-none">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`w-full h-[1px] transition-colors duration-300 ${
                tick <= zoomLevel ? "bg-yellow-500/40" : "bg-zinc-700/50"
              }`}
            />
          ))}
        </div>

        {/* Barre de remplissage jaune */}
        <div
          className="absolute bottom-0 left-0 w-full bg-yellow-500 transition-all duration-200 ease-out shadow-[0_0_15px_rgba(234,179,8,0.3)] rounded-full"
          style={{ height: `${percentage}%` }}
        />

        {/* Curseur rond */}
        <div
          className="absolute left-1/2 w-4 h-4 bg-white border-2 border-yellow-500 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.6)] pointer-events-none z-10 transition-all duration-200 ease-out"
          style={{
            bottom: `${percentage}%`,
            transform: "translate(-50%, 50%)",
          }}
        />

        {/* Input de contrôle */}
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={zoomLevel}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
            WebkitAppearance: "slider-vertical",
          }}
        />
      </div>

      {/* BOUTON ZOOM - */}
      <button 
        onClick={handleZoomOut}
        className="mt-4 transition-all duration-300 hover:scale-125 active:scale-90 z-30"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600 hover:text-yellow-500 transition-colors"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};

export default VerticalZoomSlider;