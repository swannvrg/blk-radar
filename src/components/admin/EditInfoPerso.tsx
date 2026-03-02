"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingScreen from "../LoadingScreen";
import { X, MapPin, Upload, Trash2, AlertTriangle } from "lucide-react";

interface EditInfoPersoProps {
  talent: any;
  onClose: () => void;
}

export default function EditInfoPerso({ talent, onClose }: EditInfoPersoProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>({
    lat: talent.latitude,
    lng: talent.longitude,
  });
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // État pour la suppression de compte
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
  setIsLoading(true);

  try {
    // 1. On vérifie si c'est l'Admin BLK (via ton mdp fort)
    const isLocalAdmin = localStorage.getItem('BLK_ADMIN_KEY') === process.env.NEXT_PUBLIC_ADMIN_SECRET;

    // 2. Si ce n'est pas l'admin, on vérifie si c'est le Talent via son Token
    const specificToken = localStorage.getItem(`BLK_TOKEN_${talent.id}`);
    const isAuthorizedTalent = specificToken === `token_${talent.id}`;

    // Sécurité : Si ni l'un ni l'autre, on bloque
    if (!isLocalAdmin && !isAuthorizedTalent) {
      toast.error("Vous n'avez pas l'autorisation de supprimer ce profil.");
      setIsLoading(false);
      return;
    }

    // 3. Suppression de l'image (Storage)
    if (talent.image_url) {
      const fileName = talent.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("talents-pics").remove([fileName]);
      }
    }

    // 4. Suppression dans la Table (On utilise l'API Admin si possible, ou on bypass via RLS)
    const { error: dbError } = await supabase
      .from("talents")
      .delete()
      .eq("id", talent.id);

    if (dbError) throw dbError;

    toast.success("Compte supprimé avec succès.");
    
    // 5. Nettoyage local
    if (isAuthorizedTalent) {
      localStorage.removeItem(`BLK_TOKEN_${talent.id}`);
    }

    window.location.href = "/";
  } catch (err: any) {
    console.error("Delete error:", err);
    toast.error(`Erreur: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // --- LOGIQUE AUTOCOMPLÉTION VILLE ---
  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=10`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setIsSuggestionsVisible(true);
    } catch (error) {
      console.error("Erreur suggestions:", error);
    }
  };

  // --- LOGIQUE UPLOAD IMAGE ---
  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return talent.image_url;

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension || "png"}`;
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
    <div className="bg-zinc-900 border border-yellow-500/30 p-8 rounded-2xl shadow-2xl relative max-w-2xl mx-auto">
      {isLoading && <LoadingScreen />}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Éditer les <span className="text-yellow-500">infos persos</span>
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              required
              className="w-full p-3 bg-black border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none transition-all text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">
              Nom *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              required
              className="w-full p-3 bg-black border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none transition-all text-white"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">
            Ville *
          </label>
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
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
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
                      lat: s.geometry.coordinates[1],
                    });
                    setFormData({ ...formData, city: s.properties.city });
                    setIsSuggestionsVisible(false);
                  }}
                  className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer text-white border-b border-zinc-800 last:border-0 transition-colors text-sm"
                >
                  {s.properties.label}{" "}
                  <span className="text-xs opacity-50">
                    ({s.properties.postcode})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">
            Spécialité *
          </label>
          <select
            value={formData.specialty}
            onChange={(e) =>
              setFormData({ ...formData, specialty: e.target.value })
            }
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

        <div className="pt-2">
          <label className="block text-xs font-black uppercase text-yellow-500 mb-3 tracking-widest">
            Photo du Profil
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-xl cursor-pointer bg-black hover:bg-zinc-900 hover:border-yellow-500 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={24} className="text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-white">
                  Cliquez pour remplacer
                </span>
              </p>
              <p className="text-[10px] text-zinc-600 uppercase mt-1">
                PNG, JPG ou WEBP
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setImageFile(e.target.files[0])
              }
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedCoordinates}
          className="w-full py-4 rounded-xl text-black bg-yellow-500 hover:bg-yellow-400 font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? "Mise à jour en cours..." : "Valider les changements"}
        </button>
      </form>

      {/* --- SECTION DANGER : SUPPRESSION --- */}
      <div className="mt-12 pt-8 border-t border-zinc-800">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} /> Supprimer mon compte
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={20} />
              <p className="text-xs font-bold uppercase italic">
                Es-tu sûr ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg transition-all"
              >
                Confirmer la suppression
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase rounded-lg transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
