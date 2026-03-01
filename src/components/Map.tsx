"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import { X } from "lucide-react";
import { useRef } from "react";

// Interface pour les talents
interface Talent {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  specialty?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  interview_url?: string;
}

interface TalentMarkerProps {
  talent: Talent;
}

const JAWG_TOKEN = process.env.NEXT_PUBLIC_JAWG_ACCESS_TOKEN;

const TalentMarker = React.memo(({ talent }: { talent: Talent }) => {
  const icon = useMemo(
    () => createTalentIcon(talent.image_url),
    [talent.image_url],
  );
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  // Fonction pour recentrer la carte sur le centre du POPUP
  const handleMarkerClick = () => {
    if (!map) return;

    // 1. On récupère le niveau de zoom ACTUEL de l'utilisateur
    const currentZoom = map.getZoom();
    const latlng = L.latLng(talent.latitude, talent.longitude);

    // 2. On projette le point selon le zoom en cours
    const targetPoint = map.project(latlng, currentZoom);

    // 3. On décale verticalement (ajuste +100 selon tes besoins)
    // Plus la valeur est haute, plus le talent descend à l'écran
    targetPoint.y += -100;

    // 4. On reconvertit en coordonnées sans changer le zoom
    const targetLatLng = map.unproject(targetPoint, currentZoom);

    map.flyTo(targetLatLng, currentZoom, {
      animate: true,
      duration: 0.6, // Animation rapide et fluide
      easeLinearity: 0.25,
    });
  };

  return (
    <Marker
      ref={markerRef}
      position={[talent.latitude, talent.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick, // Déclenche le recentrage offset au clic
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -15]} // On réduit l'offset car la flèche fait déjà le pont visuel
        opacity={1}
        permanent={false}
        sticky={false}
        className="blk-radar-tooltip"
      >
        <span className="font-black uppercase tracking-[0.25em] text-[9px] px-2 py-0.5">
          {talent.first_name}{" "}
          <span className="text-yellow-500">{talent.last_name}</span>
        </span>
      </Tooltip>
      <Popup
        offset={[0, 0]} // Ajuste selon la taille de tes icônes
        autoPan={false} // Empêche la carte de bouger toute seule à l'ouverture
        minWidth={240}
        closeButton={false}
        className="custom-popup"
      >
        <div className="bg-zinc-950 text-white rounded-xl overflow-hidden border border-yellow-500/30 shadow-2xl w-56 font-sans relative">
          {/* HEADER : Spécialité à gauche, Croix à droite */}
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start p-3 pointer-events-none">
            <div className="bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest pointer-events-auto">
              {talent.specialty || "Elite"}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (markerRef.current) markerRef.current.closePopup();
              }}
              className="w-6 h-6 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white hover:text-yellow-500 border border-white/10 hover:border-yellow-500/50 transition-all pointer-events-auto active:scale-90"
            >
              <X size={14} />
            </button>
          </div>

          {/* IMAGE */}
          <div className="h-36 w-full relative">
            {talent.image_url ? (
              <>
                <img
                  src={talent.image_url}
                  alt={talent.first_name}
                  className="w-full h-full object-cover grayscale-[0.2]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-yellow-500/10 text-5xl font-black italic">
                BLK
              </div>
            )}
          </div>

          {/* CONTENU */}
          <div className="p-4 -mt-2 relative z-10">
            <h3 className="text-white font-black text-xl tracking-tighter uppercase leading-tight mb-1">
              {talent.first_name}{" "}
              <span className="text-yellow-500">{talent.last_name}</span>
            </h3>

            <div className="flex items-center gap-1.5 text-zinc-400 mb-4">
              <svg
                className="w-3 h-3 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[10px] uppercase font-bold tracking-widest truncate">
                {talent.city}
              </span>
            </div>

            {/* LES DEUX BOUTONS RÉINTÉGRÉS */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {talent.interview_url && (
                <Link
                  href={talent.interview_url}
                  target="_blank"
                  className="flex items-center justify-center border border-yellow-500 font-bold !text-black py-2 rounded-md bg-yellow-500 hover:bg-white transition-colors text-[10px] uppercase"
                >
                  INTERVIEW
                </Link>
              )}
              <Link
                href={`/talents/${talent.id}`}
                className="flex items-center justify-center border border-yellow-500 font-bold !text-black py-2 rounded-md bg-yellow-500 hover:bg-white transition-colors text-[10px] uppercase"
              >
                PROFIL
              </Link>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

const createTalentIcon = (imageUrl: string | undefined | null) => {
  return L.divIcon({
    html: `
      <div class="relative group">
        <div class="w-12 h-12 rounded-full border-2 border-yellow-500 overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.5)] bg-zinc-900 transition-transform duration-500 hover:scale-110">
          ${
            imageUrl
              ? `<img src="${imageUrl}" class="w-full h-full object-cover" />`
              : `<div class="w-full h-full flex items-center justify-center bg-zinc-800 text-yellow-500 font-bold text-xl">B</div>`
          }
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-500 rotate-45"></div>
      </div>
    `,
    className: "custom-talent-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

const MapSubscriber = ({ setMap }: { setMap: (map: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);
  return null;
};

interface MapComponentProps {
  filters: {
    specialties: string[];
    selectedItems: any[];
    query: string;
    type: string;
  };
  setMap: (map: L.Map) => void;
}

const MapComponent: React.FC<MapComponentProps> = React.memo(
  ({ filters, setMap }) => {
    const [talents, setTalents] = useState<Talent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(true);

    useEffect(() => {
      const fetchTalents = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("talents")
            .select(
              "id, first_name, last_name, city, specialty, interview_url, image_url, latitude, longitude",
            )
            .order("created_at", { ascending: false });

          if (error) throw error;
          if (data) {
            const validTalents = data
              .filter(
                (talent) =>
                  talent.latitude !== null && talent.longitude !== null,
              )
              .map((talent) => ({
                ...talent,
                // Décalage augmenté pour bien séparer les points superposés
                latitude: talent.latitude + (Math.random() - 0.5) * 0.0007, // Un peu plus grand
                longitude: talent.longitude + (Math.random() - 0.5) * 0.0007,
              })) as Talent[];

            setTalents(validTalents);
          }
        } catch (err: any) {
          setError(`Erreur de chargement: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTalents();
    }, []);

    const centerFrance = [46.603355, 1.888334] as [number, number];

    const filteredTalents = useMemo(() => {
      // Formule Haversine pour les KM
      const getDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
      ) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      return talents.filter((talent) => {
        // 1️⃣ FILTRE SPÉCIALITÉ
        const matchSpecialty =
          filters.specialties.length === 0 ||
          filters.specialties.includes((talent.specialty || "").toLowerCase());

        // 2️⃣ SÉPARATION DES ITEMS
        const cityFilters = filters.selectedItems.filter(
          (i) => i.type === "ville",
        );
        const nameFilters = filters.selectedItems.filter(
          (i) => i.type === "personne",
        );

        const talentCity = (talent.city || "").toLowerCase();
        const fullName =
          `${talent.first_name || ""} ${talent.last_name || ""}`.toLowerCase();

        // Dans ton Match Ville (Logique Range)
        const matchCity =
          cityFilters.length === 0 ||
          cityFilters.some((item) => {
            const filterVal = (item.value || "").toLowerCase();
            const currentRange = Number(item.range);

            // A. Match texte (Arrondissements)
            const isBigCity = ["paris", "lyon", "marseille"].includes(
              filterVal,
            );
            const textMatch = isBigCity
              ? talentCity.startsWith(filterVal)
              : talentCity === filterVal;

            // SI RANGE = 0 : On veut uniquement le texte exact, on stoppe là.
            if (currentRange === 0) return textMatch;

            // Si match texte normal, on valide
            if (textMatch) return true;

            // B. Match Distance (Le périmètre)
            if (
              item.coords &&
              Array.isArray(item.coords) &&
              talent.latitude &&
              talent.longitude
            ) {
              const distance = getDistance(
                Number(item.coords[1]),
                Number(item.coords[0]),
                Number(talent.latitude),
                Number(talent.longitude),
              );

              // DEBUG SPÉCIFIQUE VILLEURBANNE
              if (talent.city?.toLowerCase().includes("villeurbanne")) {
                console.log(
                  `🔍 Test Distance: ${talent.first_name} est à ${distance.toFixed(2)}km de ${item.value}. (Périmètre autorisé: ${currentRange}km)`,
                );
              }

              // On compare à la range du tag
              return distance <= currentRange;
            }

            return false;
          });

        // 4️⃣ MATCH NOM
        const matchName =
          nameFilters.length === 0 ||
          nameFilters.some((item) =>
            fullName.includes(item.value.toLowerCase()),
          );

        return matchSpecialty && matchCity && matchName;
      });
    }, [talents, filters]);

    return (
      <div className="relative w-full h-[80vh] bg-zinc-950">
        <MapContainer
          center={centerFrance}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          preferCanvas={true}
          zoomControl={false}
          attributionControl={false}
          maxBounds={[
            [20.0, -20.0],
            [70.0, 28.0],
          ]}
        >
          <MapSubscriber setMap={setMap} />

          <TileLayer
            url={`https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?lang=fr&access-token=${JAWG_TOKEN}`}
            attribution='&copy; <a href="http://jawg.io/">JawgMaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] overflow-hidden">
              {/* Conteneur Radar plein écran */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Cercles concentriques géants */}
                <div className="absolute w-[150vmax] h-[150vmax] border border-yellow-500/10 rounded-full"></div>
                <div className="absolute w-[100vmax] h-[100vmax] border border-yellow-500/10 rounded-full"></div>
                <div className="absolute w-[60vmax] h-[60vmax] border border-yellow-500/15 rounded-full"></div>
                <div className="absolute w-[30vmax] h-[30vmax] border border-yellow-500/20 rounded-full"></div>

                {/* Lignes d'axes s'étendant à l'infini */}
                <div className="absolute w-full h-[1px] bg-yellow-500/10"></div>
                <div className="absolute h-full w-[1px] bg-yellow-500/10"></div>

                {/* Le faisceau de balayage rotatif géant */}
                <div
                  className="absolute w-[150vmax] h-[150vmax] rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 50% 50%, rgba(255, 215, 0, 0.3) 0deg, transparent 120deg)",
                    animation: "radar-spin 4s linear infinite",
                  }}
                ></div>

                {/* Grille de fond subtile */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(#FFD700 0.5px, transparent 0.5px)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              {/* Interface de chargement centrale */}
              <div className="relative z-[1001] flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_20px_#FFD700] z-10"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl flex flex-col items-center shadow-2xl">
                  <span className="text-[#FFD700] text-[10px] font-black tracking-[0.5em] uppercase mb-4 animate-pulse">
                    CHARGEMENT DU RADAR
                  </span>

                  {/* Barre de progression stylisée */}
                  <div className="w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 shadow-[0_0_10px_#FFD700]"
                      style={{
                        width: "100%",
                        animation: "pulse-soft 2s infinite ease-in-out",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={30}
              disableClusteringAtZoom={15}
              spiderfyOnMaxZoom={false}
              showCoverageOnHover={false} // Désactive la zone bleue au survol
              spiderLegPolylineOptions={{ weight: 0, opacity: 0 }} // Désactive le trait bleu à l'éclatement
              removeOutsideVisibleBounds={false}
              zoomToBoundsOnClick={false}
              //  ON APPLIQUE l'animation fluide pour TOUS les clics sur groupes
              eventHandlers={{
                clusterclick: (e: any) => {
                  const cluster = e.layer;
                  const map = e.target._map;

                  // Récupère la zone (bounds) qui contient tous les talents du groupe
                  const bounds = cluster.getBounds();

                  // Animation cinématique fluide vers le groupe
                  map.flyToBounds(bounds, {
                    padding: [50, 50], // Marge pour ne pas coller aux bords
                    duration: 0.8, // Durée de l'animation
                    easeLinearity: 0.25,
                  });
                },
              }}
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-yellow-500/20 rounded-full animate-pulse"></div>
          <div class="bg-yellow-500 text-black font-black rounded-full w-10 h-10 flex items-center justify-center border-2 border-black shadow-[0_0_15px_rgba(234,179,8,0.6)] text-sm">
            ${count}
          </div>
        </div>`,
                  className: "custom-marker-cluster",
                  iconSize: L.point(40, 40),
                });
              }}
            >
              {filteredTalents.map((talent) => (
                <TalentMarker key={talent.id} talent={talent} />
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>
    );
  },
);

export default MapComponent;
