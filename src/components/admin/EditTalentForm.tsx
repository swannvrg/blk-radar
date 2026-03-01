"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";

export default function EditTalentForm({ talent }: { talent: any }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  
  // États pour les réseaux sociaux (JSON)
  const [socials, setSocials] = useState<Record<string, string>>(talent.social_links || {});
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [platformUrl, setPlatformUrl] = useState("");
  

  const [formData, setFormData] = useState({
    project_description: talent.project_description || "",
    needs: talent.needs || "",
    goals: talent.goals || "",
    interview_url: talent.interview_url || "",
    specialty: talent.specialty  // Nouveau champ spécialité
  });

  // Configuration des placeholders dynamiques
  const placeholderExamples: Record<string, string> = {
    instagram: "https://instagram.com/nomducompte",
    tiktok: "https://tiktok.com/@nomducompte",
    youtube: "https://youtube.com/@nomducompte",
    twitter: "https://x.com/nomducompte",
    linkedin: "https://linkedin.com/in/nomducompte",
    mail: "exemple@domaine.com"
  };

  // Fonction de validation et d'ajout d'un réseau/mail
  const addSocial = () => {
    if (!platformUrl) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^https?:\/\/.+/;
    

    if (selectedPlatform === "mail") {
      if (!emailRegex.test(platformUrl)) {
        toast.error("Format email invalide (ex: nom@domaine.com)");
        return;
      }
    } else {
      if (!urlRegex.test(platformUrl)) {
        toast.error("Le lien doit commencer par http:// ou https://");
        return;
      }
    }

    setSocials({ ...socials, [selectedPlatform]: platformUrl });
    setPlatformUrl("");
    toast.success(`${selectedPlatform.toUpperCase()} ajouté`);
  };

  const removeSocial = (key: string) => {
    const newSocials = { ...socials };
    delete newSocials[key];
    setSocials(newSocials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // On extrait "mail" de l'objet socials
    const { mail, ...otherSocials } = socials;
    const { data, error, status } = await supabase
        .from("talents")
        .update({
        project_description: formData.project_description,
        needs: formData.needs,
        goals: formData.goals,
        specialty: formData.specialty,
        interview_url: formData.interview_url,
        email: mail || talent.email,
        social_links: otherSocials 
        })
        .eq("id", talent.id)
        .select(); // Crucial pour vérifier si l'update a touché une ligne

    if (error) {
        toast.error(`Erreur : ${error.message}`);
    } else if (data && data.length === 0) {
        toast.error("Échec : Le profil n'a pas été trouvé ou modification interdite.");
    } else {
        toast.success("Profil BLK RADAR mis à jour !");
        router.push(`/talents/${talent.id}`);
        router.refresh();
    }
    setLoading(false);
    };



  return (
    <>
    {loading && <LoadingScreen />}
    <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900 border border-yellow-500 p-8 rounded-2xl shadow-2xl">
      {loading && <LoadingScreen />}
      {/* 1. SECTION SPÉCIALITÉ */}
        <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-3 uppercase tracking-tighter">
            Spécialité principale
        </h2>
        <select 
            value={formData.specialty} // React sélectionne automatiquement l'option correspondante
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 outline-none focus:border-yellow-500 transition-all cursor-pointer"
        >
            {/* Option par défaut si rien n'est enregistré */}
            <option value="" disabled>Sélectionnez une spécialité</option>
            
            <option value="mode">Mode / Design</option>
            <option value="sport">Sport / Fitness</option>
            <option value="musique">Musique / Art</option>
            <option value="media">Média / Influence</option>
            <option value="tech">Tech / Digital</option>
            <option value="entrepreneuriat">Entrepreneuriat</option>
        </select>
        </div>

      {/* 2. SECTION BIO & PROJET */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-3 uppercase tracking-tighter">Description & Bio</h2>
        <textarea
          placeholder="Décrivez le projet du talent en détail..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-32 transition-all"
          value={formData.project_description}
          onChange={(e) => setFormData({...formData, project_description: e.target.value})}
        />
      </div>

      {/* 3. SECTION BESOINS & OBJECTIFS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-yellow-500 font-bold text-sm uppercase">Besoins actuels</label>
          <textarea
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-24"
            value={formData.needs}
            onChange={(e) => setFormData({...formData, needs: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-yellow-500 font-bold text-sm uppercase">Objectifs à long terme</label>
          <textarea
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-24"
            value={formData.goals}
            onChange={(e) => setFormData({...formData, goals: e.target.value})}
          />
        </div>
      </div>

      {/* 4. SECTION INTERVIEW MÉDIA */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-3 uppercase tracking-tighter">
            Lien de l'interview 
        </h2>
        <div className="relative">
          <input
            type="url"
            placeholder="Lien de la vidéo Instagram de l'interview..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pl-12 text-white focus:border-yellow-500 outline-none transition-all"
            value={formData.interview_url}
            onChange={(e) => setFormData({...formData, interview_url: e.target.value})}
          />
          {/* Petit icône visuel pour le champ */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
          </div>
        </div>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest pl-1">
          C'est le lien qui sera utilisé pour le bouton "VOIR L'INTERVIEW" sur le profil.
        </p>
      </div>

      {/* SECTION RÉSEAUX & CONTACT (Menu déroulant JSON) */}
        <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-3 uppercase tracking-tighter">
            Réseaux & Contact
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <select 
            value={selectedPlatform}
            onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setPlatformUrl(""); // Réinitialise l'input lors du changement de plateforme
            }}
            className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"
            >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">X (Twitter)</option>
            <option value="linkedin">LinkedIn</option>
            <option value="mail">Email Pro</option>
            </select>

            <input 
            // Bascule entre type "text" et "url" selon le choix pour la validation native
            type={selectedPlatform === "mail" ? "text" : "url"}
            // Affiche l'exemple dynamique défini dans placeholderExamples
            placeholder={`Ex: ${placeholderExamples[selectedPlatform]}`}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-all"
            value={platformUrl}
            onChange={(e) => setPlatformUrl(e.target.value)}
            />

            <button 
            type="button"
            onClick={addSocial}
            className="bg-yellow-500 text-black font-black px-6 py-3 rounded-lg hover:bg-white active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
            >
            AJOUTER
            </button>
        </div>

        {/* Affichage visuel des réseaux ajoutés (Badges) */}
        <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(socials).map(([key, value]) => (
            <div 
                key={key} 
                className="flex items-center gap-2 bg-zinc-800 border border-yellow-500/30 text-white px-4 py-2 rounded-full text-sm animate-in fade-in zoom-in duration-200"
            >
                <span className="text-yellow-500 font-black uppercase text-[10px] tracking-widest">{key}</span>
                <span className="truncate max-w-[150px] italic opacity-70 text-xs">{value as string}</span>
                <button 
                onClick={() => removeSocial(key)} 
                className="text-red-500 hover:text-white ml-2 transition-colors font-bold text-lg leading-none"
                >
                ✕
                </button>
            </div>
            ))}
        </div>
        </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 text-zinc-950 font-black py-5 rounded-xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
      >
        {loading ? "ENREGISTREMENT EN COURS..." : "CONFIRMER LES MODIFICATIONS"}
      </button>
    </form>
    </>
  );
}