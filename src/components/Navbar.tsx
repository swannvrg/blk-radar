"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "../hooks/useUserRole";
import { LogOut } from "lucide-react";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const baseStyles = "bg-white text-black font-black uppercase italic tracking-tighter py-2.5 px-7 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center text-lg border-2 border-transparent active:scale-95";

  const isTalentPage = pathname.startsWith("/talents/");
  const talentId = isTalentPage ? pathname.split("/").pop() : null;

  const { role } = useUserRole(talentId as any);

  const handleBackToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    router.push("/");
  };

  const handleLogout = () => {
    // Supprime la clé admin principale
    localStorage.removeItem('BLK_ADMIN_KEY');
    
    // Optionnel : On peut aussi nettoyer les tokens talents par sécurité
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('BLK_TOKEN_')) localStorage.removeItem(key);
    });
    
    window.location.href = "/"; 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black backdrop-blur-xl border-b border-yellow-700/50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side: Logo */}
        <div className="flex flex-col">
          <button
            onClick={handleBackToMap}
            className="text-white text-3xl font-black tracking-tighter hover:text-yellow-500 transition-colors duration-200"
          >
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              BLK{" "}
              <span className="text-yellow-500 underline decoration-1 underline-offset-4">
                RADAR
              </span>
            </h1>
          </button>
          <span className="text-white/70 text-sm hidden sm:block italic">
            Le média jeune du peuple !
          </span>
        </div>

        {/* Right Side: Buttons/Links */}
        <div className="flex items-center space-x-10">
          <button
            onClick={handleBackToMap}
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300 hidden md:block"
          >
            RADAR
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <Link
            href="/info"
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300 hidden md:block"
          >
            INFO
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/interviews"
            className="group relative text-white text-lg font-black italic uppercase tracking-tighter hover:text-yellow-500 transition-colors duration-300 hidden md:block"
          >
            INTERVIEWS
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <div className="flex items-center gap-4">
            {/* BOUTON ACTION PRINCIPAL */}
            {role === "admin" || (role === "talent" && isTalentPage) ? (
              isTalentPage && talentId ? (
                <Link href={`/admin/edit/${talentId}`} className={baseStyles}>
                  {role === "talent" ? "MODIFIER MON PROFIL" : "MODIFIER"}
                </Link>
              ) : (
                <Link href="/admin/add" className={baseStyles}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Ajouter Talent
                </Link>
              )
            ) : (
              <Link href="/#form-talent" className={baseStyles}>
                NOUS REJOINDRE
              </Link>
            )}

            {/* BOUTON LOGOUT : EXCLUSIVEMENT POUR L'ADMIN GLOBAL */}
            {role === "admin" && (
              <button
                onClick={handleLogout}
                className="p-2 text-white/30 hover:text-red-500 transition-colors duration-300 ml-2"
                title="Quitter le mode Admin"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;