"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // Correct import for client component
import { User } from "@supabase/supabase-js"; // Import User type
import { useRouter } from "next/navigation"; // For navigation
import { Toaster, toast } from "sonner"; // For notifications
import Link from "next/link";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { useUserRole } from "../hooks/useUserRole";

interface TalentForDisplay {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  specialty?: string;
  image_url?: string;
  project_description?: string;
  needs?: string;
  goals?: string;
  interview_url?: string;
  social_links?: any;
  email?: string;
}

interface TalentProfileClientProps {
  talent: TalentForDisplay;
  isAdmin: boolean;
  currentUser: User | null; // Pass current user for more granular admin checks if needed
}

const TalentProfileClient: React.FC<TalentProfileClientProps> = ({
  talent,
  isAdmin,
  currentUser,
}) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(
    talent.project_description || "",
  );
  const [editedNeeds, setEditedNeeds] = useState(talent.needs || "");
  const [editedGoals, setEditedGoals] = useState(talent.goals || "");
  const [editedInterviewUrl, setEditedInterviewUrl] = useState(
    talent.interview_url || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const SOCIAL_ORDER = [
    "instagram",
    "youtube",
    "tiktok",
    "twitter",
    "linkedin",
  ];
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { role } = useUserRole(talent.id);
  const canEdit = role === "admin" || role === "talent";

  /* magic link generation */
  const copyMagicLink = () => {
    const token = `token_${talent.id}`;
    const baseUrl = window.location.origin;
    const magicLink = `${baseUrl}/talents/${talent.id}?token=${token}`;

    navigator.clipboard.writeText(magicLink);
    toast.success(`Lien copié pour ${talent.first_name} !`, {
      style: { background: "#EAB308", color: "#000" },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("talents")
        .update({
          project_description: editedProject,
          needs: editedNeeds,
          goals: editedGoals,
          interview_url: editedInterviewUrl, // Le lien d'interview insta du jeune
        })
        .eq("id", talent.id);

      if (error) {
        throw error;
      }

      toast.success("Profil mis à jour avec succès !", {
        style: {
          background: "#EAB308", // Yellow-500
          color: "#000000", // Black text
        },
      });
      setIsEditing(false); // Exit edit mode on successful save
    } catch (err: any) {
      toast.error(`Erreur lors de la sauvegarde: ${err.message}`, {
        style: {
          background: "#dc2626", // Red for error
          color: "#ffffff", // White text
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render a section with a title and content, handling edit mode
  const renderEditableSection = (
    title: string,
    content: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    type: "textarea" | "input" = "textarea",
  ) => (
    <div className="bg-zinc-900 border border-yellow-700 p-6 rounded-lg shadow-xl">
      <h3 className="text-2xl font-bold text-yellow-500 mb-4 tracking-wide">
        {title}
      </h3>
      {isEditing ? (
        type === "textarea" ? (
          <textarea
            value={content}
            onChange={(e) => setter(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-md border border-zinc-700 focus:ring-yellow-500 focus:border-yellow-500 min-h-[150px]"
            placeholder={`Décrivez ici le ${title.toLowerCase()} du talent...`}
          />
        ) : (
          <input
            type="url"
            value={content}
            onChange={(e) => setter(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-md border border-zinc-700 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder={`Ajoutez l'URL de ${title.toLowerCase()} ici...`}
          />
        )
      ) : (
        <p className="text-zinc-300 whitespace-pre-wrap">
          {content || `Aucun ${title.toLowerCase()} renseigné pour le moment.`}
        </p>
      )}
    </div>
  );

  /* retour a la map en haut de page */
  const handleBackToMap = (e: React.MouseEvent) => {
    e.preventDefault(); // On stoppe le comportement par défaut du lien
    window.scrollTo(0, 0); // On remonte tout en haut
    router.push("/"); // On change de page
  };

  /* association nom bdd a icon des reseaux */
  const iconMap: Record<string, React.ElementType> = {
    instagram: Instagram,
    tiktok: ({ size, className }: { size: number; className: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ), // TikTok n'est pas dans Lucide par défaut
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
  };
  const socialLinks = React.useMemo(() => {
    if (!talent.social_links) return {};
    if (typeof talent.social_links === "object") return talent.social_links;
    try {
      return JSON.parse(talent.social_links);
    } catch (e) {
      return {};
    }
  }, [talent.social_links]);

  return (
    <div className="min-h-screen overflow-y-auto custom-scrollbar px-4 py-8">
      <Toaster position="top-center" richColors />{" "}
      <div className="relative w-full h-[65vh] flex flex-col items-center justify-center overflow-hidden mb-12 bg-zinc-950">
        {talent.image_url && (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-t-lg">
            <div
              className="w-full h-full blur-sm scale-110"
              style={{
                backgroundImage: `url(${talent.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.6,
              }}
            />
          </div>
        )}

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent rounded-t-lg" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-zinc-950/40 to-transparent rounded-t-lg" />

        <div className="relative z-10 flex flex-col items-center px-4 w-screen max-w-7xl mx-auto">
          <div className="relative w-40 h-40 md:w-52 md:h-52 mb-8 group">
            {talent.image_url ? (
              <img
                src={talent.image_url}
                alt={`${talent.first_name} ${talent.last_name}`}
                className="w-full h-full object-cover rounded-full border-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 rounded-full border-4 border-zinc-700 flex items-center justify-center shadow-2xl">
                <span className="text-zinc-600 text-6xl font-black uppercase">
                  {talent.first_name[0]}
                  {talent.last_name[0]}
                </span>
              </div>
            )}

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 min-w-[140px] text-center bg-yellow-500 text-zinc-950 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl border-2 border-zinc-950">
              {talent.specialty || "Talent"}
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
              {talent.first_name}{" "}
              <span className="text-yellow-500">{talent.last_name}</span>
            </h1>
            <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_#EAB308]"></span>
              <p className="text-zinc-300 font-bold uppercase tracking-[0.4em] text-[10px]">
                {talent.city}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Admin Edit Button */}
      {/* Admin / Talent Edit Button */}
      {role === "admin" && (
        <div className="flex justify-end mb-8">
          <button
            onClick={copyMagicLink}
            className="flex items-center gap-2 bg-zinc-900 border border-yellow-500/50 text-yellow-500 font-black py-3 px-6 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 uppercase italic text-xs tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.1)] active:scale-95"
          >
            <ExternalLink size={16} />
            Générer accès Talent
          </button>
        </div>
      )}
      {/* Project, Needs, Goals Sections */}
      <div className="grid md:grid-cols-3 gap-8 mb-12 break-words">
        {renderEditableSection("Le Projet", editedProject, setEditedProject)}
        {renderEditableSection("Le Besoin", editedNeeds, setEditedNeeds)}
        {renderEditableSection("L'Objectif", editedGoals, setEditedGoals)}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 mb-12">
        {/* BOUTON INTERVIEW (Logique existante) */}
        {talent.interview_url ? (
          <a
            href={talent.interview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center text-zinc-950 bg-yellow-500 font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-all duration-200 shadow-lg text-lg active:scale-95"
          >
            Voir l'interview
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto inline-flex items-center justify-center text-zinc-500 bg-zinc-800 border border-zinc-700 font-bold py-3 px-8 rounded-full cursor-not-allowed opacity-50 text-lg shadow-none"
          >
            Interview bientôt
          </button>
        )}

        {/* BOUTON CONTACT MAIL - Logique conditionnelle ajoutée */}
        {talent.email ? (
          <Link
            href={`/talents/${talent.id}/contact`}
            className="w-full sm:w-auto inline-flex items-center justify-center text-white bg-zinc-800 border border-yellow-500 font-bold py-3 px-8 rounded-full hover:bg-zinc-700 transition-all duration-200 shadow-lg text-lg active:scale-95"
          >
            Contacter {talent.first_name}
          </Link>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto inline-flex items-center justify-center text-zinc-500 bg-zinc-800 border border-zinc-700 font-bold py-3 px-8 rounded-full cursor-not-allowed opacity-50 text-lg shadow-none"
          >
            Contact indisponible
          </button>
        )}
      </div>
      <div className="flex justify-center mb-12">
        <div className="bg-zinc-900 border border-yellow-700 p-8 rounded-lg shadow-xl w-fit max-w-full text-center">
          <h3 className="text-2xl font-bold text-yellow-500 mb-8 tracking-wide uppercase italic">
            Réseaux
          </h3>

          <div className="flex flex-wrap gap-6 justify-center">
            {/* On boucle sur l'ordre définit, et on n'affiche que si le lien existe */}
            {SOCIAL_ORDER.map((platform) => {
              const url = socialLinks[platform];
              if (!url) return null; // Si le talent n'a pas ce réseau, on ne l'affiche pas

              const IconComponent = iconMap[platform] || ExternalLink;

              return (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl hover:border-yellow-500 hover:bg-yellow-500/5 transition-all duration-300 min-w-[160px]"
                >
                  <div className="p-2 bg-zinc-900 rounded-lg group-hover:text-yellow-500 text-white transition-colors">
                    <IconComponent size={24} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-black text-yellow-500/50 tracking-widest">
                      {platform}
                    </span>
                    <span className="text-white font-semibold group-hover:text-yellow-500 transition-colors">
                      Voir le profil
                    </span>
                  </div>
                </a>
              );
            })}

            {/* Cas de secours si aucun des réseaux de l'ordre défini n'existe */}
            {Object.keys(socialLinks).length === 0 && (
              <p className="text-white/40 italic">
                Aucun réseau social renseigné pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* RETOUR CARTE Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleBackToMap}
          className="bg-yellow-500 text-zinc-950 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          RETOUR CARTE
        </button>
      </div>
    </div>
  );
};

export default TalentProfileClient;
