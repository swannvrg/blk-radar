"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "../hooks/useUserRole";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react"; // Assure-toi d'avoir lucide-react

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const baseStyles =
    "bg-white text-black font-black uppercase italic tracking-tighter py-2.5 px-7 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center text-lg border-2 border-transparent active:scale-95";

  const isTalentPage = pathname.startsWith("/talents/");
  const talentId = isTalentPage ? pathname.split("/").pop() : null;

  const { role } = useUserRole(talentId as any);

  // Ajoute le "?" après le "e" pour dire qu'il peut être absent
  const handleBackToMap = (e?: React.MouseEvent) => {
    // On n'appelle preventDefault que si l'événement existe
    if (e) e.preventDefault();

    window.scrollTo(0, 0);
    router.push("/");
  };

  const handleLogout = () => {
    // Supprime la clé admin principale
    localStorage.removeItem("BLK_ADMIN_KEY");

    // Optionnel : On peut aussi nettoyer les tokens talents par sécurité
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("BLK_TOKEN_")) localStorage.removeItem(key);
    });

    window.location.href = "/";
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/90 backdrop-blur-xl border-b border-yellow-700/50 h-20 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* CÔTÉ GAUCHE : LOGO */}
        <div className="flex flex-col">
          <button
            onClick={handleBackToMap}
            className="text-white hover:text-yellow-500 transition-colors duration-200 text-left"
          >
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
              BLK{" "}
              <span className="text-yellow-500 underline decoration-1 underline-offset-4">
                RADAR
              </span>
            </h1>
          </button>
          <span className="text-white/70 text-xs min-[220px]:block hidden ">
            Le média jeune du peuple !
          </span>
        </div>

        {/* CÔTÉ DROIT : DESKTOP LINKS */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={handleBackToMap}
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300"
          >
            RADAR
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <Link
            href="/info"
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300"
          >
            INFO
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/interviews"
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300"
          >
            INTERVIEWS
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <div className="flex items-center gap-4">
            {role === "admin" || (role === "talent" && isTalentPage) ? (
              isTalentPage && talentId ? (
                <Link href={`/admin/edit/${talentId}`} className={baseStyles}>
                  {role === "talent" ? "MODIFIER MON PROFIL" : "MODIFIER"}
                </Link>
              ) : (
                <Link href="/admin/add" className={baseStyles}>
                  <Menu className="h-5 w-5 mr-2" /> Ajouter Talent
                </Link>
              )
            ) : (
              <Link href="/#form-talent" className={baseStyles}>
                NOUS REJOINDRE
              </Link>
            )}

            {role === "admin" && (
              <button
                onClick={handleLogout}
                className="p-2 text-white/30 hover:text-red-500 transition-colors ml-2"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>

        {/* BOUTON HAMBURGER (MOBILE SEULEMENT) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            {isOpen ? (
              <X size={30} className="text-yellow-500" />
            ) : (
              <Menu size={30} />
            )}
          </button>
        </div>
      </div>

      {/* MENU MOBILE OVERLAY */}
      <div
        className={`fixed inset-0 top-[72px] w-full h-[calc(100vh-72px)] bg-black transition-transform duration-300 ease-in-out z-[999] md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* On ajoute un conteneur avec un bg noir pur pour bloquer la vue du site derrière */}
        <div className="flex flex-col items-center justify-start pt-12 space-y-8 h-full bg-black">
          {/* AJOUT DU TITRE RADAR MANQUANT */}
          <button
            onClick={() => {
              handleBackToMap();
              toggleMenu();
            }}
            className="text-4xl font-black italic uppercase text-white hover:text-yellow-500 tracking-tighter"
          >
            RADAR
          </button>

          <Link
            href="/info"
            onClick={toggleMenu}
            className="text-4xl font-black italic uppercase text-white hover:text-yellow-500 tracking-tighter"
          >
            INFO
          </Link>

          <Link
            href="/interviews"
            onClick={toggleMenu}
            className="text-4xl font-black italic uppercase text-white hover:text-yellow-500 tracking-tighter"
          >
            INTERVIEWS
          </Link>

          {/* SÉPARATEUR JAUNE POUR PLUS DE STYLE */}
          <div className="w-24 h-1 bg-yellow-500 my-4"></div>

          <div className="w-full px-8 flex flex-col items-center gap-6">
            {role === "admin" || (role === "talent" && isTalentPage) ? (
              isTalentPage && talentId ? (
                <Link
                  href={`/admin/edit/${talentId}`}
                  onClick={toggleMenu}
                  className={baseStyles}
                >
                  {role === "talent" ? "MODIFIER MON PROFIL" : "MODIFIER"}
                </Link>
              ) : (
                <Link
                  href="/admin/add"
                  onClick={toggleMenu}
                  className={baseStyles}
                >
                  Ajouter Talent
                </Link>
              )
            ) : (
              <Link
                href="/#form-talent"
                onClick={toggleMenu}
                className={baseStyles}
              >
                NOUS REJOINDRE
              </Link>
            )}

            {role === "admin" && (
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="flex items-center gap-2 text-red-500 font-bold uppercase py-4"
              >
                <LogOut size={24} /> DÉCONNEXION
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
