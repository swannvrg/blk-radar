"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { sendPartenariatEmail } from "@/app/actions/partenariatAction";
import { useRouter } from "next/navigation";

export default function PartenariatForm() {
  const [formData, setFormData] = useState({
    entreprise: "",
    contact: "",
    email: "",
    budget: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await sendPartenariatEmail(formData);

      if (!res.error) {
        toast.success("Proposition transmise. Bienvenue dans le Radar.");
        setFormData({
          entreprise: "",
          contact: "",
          email: "",
          budget: "",
          message: "",
        });

        // Petite pause pour laisser lire le toast avant de rediriger
        setTimeout(() => router.push("/"), 1500);
      } else {
        toast.error("Erreur lors de la transmission.");
      }
    } catch (error) {
      toast.error("Connexion au Radar impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="partenariat"
      className="w-full bg-zinc-950 py-20 border-t border-zinc-900"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="py-5 text-center border-b border-zinc-900">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            WORK WITH <span className="text-yellow-500 italic">BLK.</span>
          </h1>
        </div>
        <h2 className="text-5xl font-black uppercase text-white mb-10 text-center pt-5">
          Devenir <span className="text-yellow-500 italic">Sponsor</span>
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/40 backdrop-blur-md p-12 rounded-[40px] border border-zinc-800/50 shadow-2xl relative overflow-hidden"
        >
          {/* Ligne décorative subtile en haut */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">
              Société
            </label>
            <input
              placeholder="NOM DE L'ENTREPRISE"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 outline-none text-white font-black text-xs focus:border-yellow-500 transition-all placeholder:text-zinc-700"
              value={formData.entreprise}
              onChange={(e) =>
                setFormData({ ...formData, entreprise: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">
              Représentant
            </label>
            <input
              placeholder="NOM DU CONTACT"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 outline-none text-white font-black text-xs focus:border-yellow-500 transition-all placeholder:text-zinc-700"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">
              Email Pro
            </label>
            <input
              type="email"
              placeholder="MAIL@ENTREPRISE.COM"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 outline-none text-white font-black text-xs focus:border-yellow-500 transition-all placeholder:text-zinc-700"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">
              Enveloppe
            </label>
            <select
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 outline-none text-zinc-400 font-black text-xs focus:border-yellow-500 transition-all appearance-none cursor-pointer"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            >
              <option value="" className="bg-zinc-950">
                SÉLECTIONNER UN BUDGET
              </option>
              <option value="< 1000€" className="bg-zinc-950">
                MOINS DE 1000€
              </option>
              <option value="1000€ - 5000€" className="bg-zinc-950">
                1000€ - 5000€
              </option>
              <option value="5000€+" className="bg-zinc-950">
                PLUS DE 5000€
              </option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">
              Détails du projet
            </label>
            <textarea
              placeholder="DÉCRIVEZ VOTRE VISION DU PARTENARIAT..."
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 outline-none text-white font-black text-xs resize-none h-40 focus:border-yellow-500 transition-all placeholder:text-zinc-700"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 group relative bg-yellow-500 text-black font-black py-5 rounded-2xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_20px_40px_rgba(234,179,8,0.15)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 italic uppercase text-sm">
              {loading
                ? "TRANSMISSION AU RADAR..."
                : "Envoyer la proposition de sponsoring"}
            </span>
            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>
        </form>
      </div>
    </section>
  );
}
