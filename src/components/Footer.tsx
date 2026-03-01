"use client";

import {
  Instagram,
  Twitter,
  Youtube,
  Send,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-zinc-800 pt-16 pb-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* COLONNE 1 : BRAND & BIO */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              BLK{" "}
              <span className="text-yellow-500 underline decoration-1 underline-offset-4">
                RADAR
              </span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              La plateforme de détection des talents émergents. Cartographier
              l'excellence, connecter les créatifs de demain.
            </p>
          </div>

          {/* COLONNE 2 : NAVIGATION QUICK LINKS */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em]">
              Navigation
            </h3>
            <ul className="space-y-4">
              {/* LE RADAR (HOME) */}
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 text-sm hover:text-white flex items-center group transition-colors"
                >
                  Le Radar
                  <ArrowUpRight
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                  />
                </Link>
              </li>

              {/* INTERVIEWS */}
              <li>
                <Link
                  href="/interviews"
                  className="text-zinc-400 text-sm hover:text-white flex items-center group transition-colors"
                >
                  Interviews
                  <ArrowUpRight
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                  />
                </Link>
              </li>

              {/* À PROPOS / INFOS */}
              <li>
                <Link
                  href="/infos"
                  className="text-zinc-400 text-sm hover:text-white flex items-center group transition-colors"
                >
                  À Propos
                  <ArrowUpRight
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                  />
                </Link>
              </li>

              {/* PARTENARIATS (LIEN VERS FORMULAIRE INTERVIEW OU MAIL) */}
              <li>
                <Link href="/partenariats" className="text-zinc-400 text-sm hover:text-white flex items-center group transition-colors">
                  Partenariats
                  <ArrowUpRight
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT INFO */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em]">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-zinc-400">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-yellow-500 shrink-0" />
                <span>contact@blk-radar.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-yellow-500 shrink-0" />
                <span>Paris, France</span>
              </div>
              <div className="flex items-start gap-3">
                <Instagram size={18} className="text-yellow-500 shrink-0" />
                <Link
                  rel="stylesheet"
                  href="https://www.instagram.com/blk0fficiel/"
                  target="blank"
                >
                  @blk0fficiel
                </Link>
              </div>
            </div>
          </div>

          {/* COLONNE 4 : FORMULAIRE DE CONTACT RAPIDE */}
          {/* <div className="space-y-6">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em]">Message</h3>
            <form className="space-y-3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="votre@email.com" 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-yellow-500 transition-all"
                />
              </div>
              <div className="relative">
                <textarea 
                  rows={3}
                  placeholder="Votre message..." 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-yellow-500 transition-all resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-yellow-500 hover:bg-white text-black font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                Envoyer <Send size={14} />
              </button>
            </form>
          </div> */}
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            © 2026 BLK RADAR — TOUS DROITS RÉSERVÉS
          </p>
          <div className="flex gap-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
