"use client";

import React, { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { sendInterviewEmail } from "@/app/actions/sendEmail"; // Vérifie ce chemin
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DemandeInterviewForm() {
  // 1. DÉCLARATION DES VARIABLES (Ce qui manquait)
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [ambitions, setAmbitions] = useState("");
  const [attentes, setAttentes] = useState("");
  const [socials, setSocials] = useState<Record<string, string>>({});

  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [platformUrl, setPlatformUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Gestion des réseaux sociaux
  const addSocial = () => {
    if (!platformUrl) return;
    setSocials({ ...socials, [selectedPlatform]: platformUrl });
    setPlatformUrl("");
  };

  const removeSocial = (key: string) => {
    const newSocials = { ...socials };
    delete newSocials[key];
    setSocials(newSocials);
  };

  // LOGIQUE D'ENVOI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendInterviewEmail({
        nom,
        prenom,
        email,
        description,
        ambitions,
        attentes,
        socials,
      });

      if (result.error) throw new Error(result.error);

      // --- LE RESET COMMENCE ICI ---
      setNom("");
      setPrenom("");
      setEmail("");
      setDescription("");
      setAmbitions("");
      setAttentes("");
      setSocials({});
      // -----------------------------

      toast.success("Demande envoyée ! Le formulaire a été réinitialisé.");

      // Si tu veux quand même rediriger après un petit délai :
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      toast.error("Échec de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (window.location.hash === "#form-talent") {
      setTimeout(() => {
        const element = document.getElementById("form-talent");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500); // On attend 500ms que la page et la carte soient chargées
    }
  }, []);

  return (
    <section
      className="w-full bg-zinc-950 overflow-hidden border-none p-0 m-0 "
      id="form-talent"
    >
      {/* LIGNE JAUNE HAUT : Longue et fine */}
      <div className="w-2/3 h-[1px] bg-yellow-500/40 mx-auto mt-12 shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* GAUCHE : TEXTE ÉDITORIAL (Comble le vide) */}
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              TON TALENT <br />
              <span className="text-yellow-500 italic">MÉRITE</span> <br />
              D'ÊTRE VU.
            </h2>
            <p className="text-zinc-400 text-lg font-medium leading-tight max-w-md">
              On ne se contente pas de lister des profils. On raconte des
              histoires. On met en lumière ceux qui construisent le futur.
            </p>
          </div>

          {/* DROITE : FORMULAIRE JAUNE */}
          <div className="relative bg-[#EAB308] p-8 md:p-12 rounded-[32px] shadow-2xl overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-black">
                REJOINS LE <span className="italic underline">RADAR !</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all"
                  placeholder="TON MAIL"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all"
                    placeholder="NOM"
                    required
                  />
                  <input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all"
                    placeholder="PRÉNOM"
                    required
                  />
                </div>

                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all resize-none"
                  placeholder="TON PROJET..."
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    value={ambitions}
                    onChange={(e) => setAmbitions(e.target.value)}
                    className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all resize-none"
                    placeholder="TES AMBITIONS ?"
                  />
                  <textarea
                    rows={2}
                    value={attentes}
                    onChange={(e) => setAttentes(e.target.value)}
                    className="w-full bg-black/5 border border-black/20 rounded-xl px-4 py-3 outline-none font-black text-black placeholder:text-black/30 text-sm focus:border-black transition-all resize-none"
                    placeholder="POURQUOI NOUS ?"
                  />
                </div>

                {/* RÉSEAUX */}
                <div className="pt-2 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="bg-black rounded-xl px-3 text-[13px] font-black text-white outline-none cursor-pointer"
                    >
                      <option value="instagram">INSTAGRAM</option>
                      <option value="tiktok">TIKTOK</option>
                      <option value="autre">AUTRE</option>
                    </select>
                    <input
                      value={platformUrl}
                      onChange={(e) => setPlatformUrl(e.target.value)}
                      className="flex-1 bg-black/5 border border-black/20 rounded-xl px-4 py-3 text-xs font-black !text-black placeholder:text-black/40 outline-none focus:border-black transition-all"
                      placeholder="URL OU @PSEUDO"
                    />
                    <button
                      type="button"
                      onClick={addSocial}
                      className="bg-black px-6 rounded-xl text-[13px] font-black text-white hover:scale-105 active:scale-95 transition-all"
                    >
                      OK
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(socials).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-black text-white px-3 py-1.5 rounded-full text-[11px] flex items-center gap-2"
                      >
                        <span className="uppercase tracking-wider">{key}</span>
                        <button
                          onClick={() => removeSocial(key)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-[#EAB308] text-sm font-black py-4 rounded-xl active:scale-[0.98] hover:opacity-90 transition-all shadow-lg"
                >
                  {isSubmitting ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* LIGNE JAUNE BAS : Longue et fine */}
      <div className="w-2/3 h-[1px] bg-yellow-500/40 mx-auto mb-12 shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
    </section>
  );
}
