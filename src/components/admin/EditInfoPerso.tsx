"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import LoadingScreen from "../LoadingScreen";
import { X, MapPin, Upload } from "lucide-react";

interface EditInfoPersoProps {
  talent: any;
  onClose: () => void;
}

export default function EditInfoPerso ({ talent, onClose }: EditInfoPersoProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  // États du formulaire
  const [formData, setFormData] = useState({
    first_name: talent.first_name || "",
    last_name: talent.last_name || "",
    city: talent.city || "",
    specialty: talent.specialty || "",
    interview_url: talent.interview_url || "",
  });

  // États pour l'image et la ville
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cityQuery, setCityQuery] = useState(talent.city || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>({
    lat: talent.latitude,
    lng: talent.longitude
  });
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIQUE AUTOCOMPLÉTION VILLE ---
  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=10`);
      const data = await response.json();
      setSuggestions(data.features || []);
      setIsSuggestionsVisible(true);
    } catch (error) {
      console.error("Erreur suggestions:", error);
    }
  };

  // --- LOGIQUE UPLOAD IMAGE ---
  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return talent.image_url; // Garde l'ancienne image si pas de nouveau fichier

    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension || 'png'}`;
    const bucketName = "talents-pics";

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err: any) {
      toast.error(`Erreur upload image: ${err.message}`);
      return null;
    }
  };

  // --- SOUMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = talent.image_url;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from("talents")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          city: formData.city,
          specialty: formData.specialty,
          interview_url: formData.interview_url,
          image_url: finalImageUrl,
          latitude: selectedCoordinates?.lat,
          longitude: selectedCoordinates?.lng,
        })
        .eq("id", talent.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-yellow-500/30 p-8 rounded-2xl shadow-2xl relative">
      {isLoading && <LoadingScreen />}
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Éditer les <span className="text-yellow-500">infos persos</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Prénom *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
              className="w-full p-3 bg-black border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none transition-all text-white"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Nom *</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              required
              className="w-full p-3 bg-black border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none transition-all text-white"
            />
          </div>
        </div>

        {/* Ville (Autocomplétion) */}
        <div className="relative">
          <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Ville *</label>
          <div className="relative">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                fetchCitySuggestions(e.target.value);
              }}
              required
              className="w-full p-3 bg-black border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none transition-all text-white pl-10"
              placeholder="Rechercher une ville..."
            />
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          </div>
          
          {isSuggestionsVisible && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-yellow-500 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCityQuery(s.properties.label);
                    setSelectedCoordinates({
                      lng: s.geometry.coordinates[0],
                      lat: s.geometry.coordinates[1]
                    });
                    setFormData({ ...formData, city: s.properties.city });
                    setIsSuggestionsVisible(false);
                  }}
                  className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer text-white border-b border-zinc-800 last:border-0 transition-colors text-sm"
                >
                  {s.properties.label} <span className="text-xs opacity-50">({s.properties.postcode})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Spécialité */}
        <div>
          <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Spécialité *</label>
          <select 
            value={formData.specialty}
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
            required
            className="w-full bg-black border border-zinc-800 rounded-xl p-3 outline-none focus:border-yellow-500 text-white transition-all appearance-none"
          >
            <option value="mode">Mode / Design</option>
            <option value="sport">Sport / Fitness</option>
            <option value="musique">Musique / Art</option>
            <option value="media">Média / Influence</option>
            <option value="tech">Tech / Digital</option>
            <option value="entrepreneuriat">Entrepreneuriat</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div className="pt-2">
          <label className="block text-xs font-black uppercase text-yellow-500 mb-3 tracking-widest">Photo du Profil</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-xl cursor-pointer bg-black hover:bg-zinc-900 hover:border-yellow-500 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={24} className="text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-white">Cliquez pour remplacer</span>
              </p>
              <p className="text-[10px] text-zinc-600 uppercase mt-1">PNG, JPG ou WEBP</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            />
          </label>
          {imageFile && (
            <p className="text-[10px] mt-2 text-yellow-500 font-bold italic uppercase">
              Nouveau fichier : {imageFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedCoordinates}
          className="w-full py-4 rounded-xl text-black bg-yellow-500 hover:bg-yellow-400 font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? "Mise à jour en cours..." : "Valider les changements"}
        </button>
      </form>
    </div>
  );
}