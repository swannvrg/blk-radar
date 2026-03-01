"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen"; // Import du composant stylisé

export default function ContactTalentPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTalent = async () => {
      const { data, error } = await supabase
        .from("talents")
        .select("first_name, last_name, email")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        toast.error("Talent introuvable");
        router.push("/");
      } else {
        setTalent(data);
      }
      setLoading(false);
    };
    fetchTalent();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true); // Active l'overlay de chargement

    const formData = new FormData(e.currentTarget);
    const payload = {
      senderName: formData.get("senderName"),
      senderEmail: formData.get("senderEmail"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      talentEmail: talent.email,
      talentName: talent.first_name,
    };

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi");

      toast.success(`Message envoyé à ${talent.first_name} !`);
      router.push(`/talents/${params.id}`);
    } catch (error) {
      toast.error("Échec de l'envoi.");
      setIsSending(false); // On ne désactive l'envoi qu'en cas d'erreur pour laisser la redirection se faire
    }
  };

  // Remplacement du message texte par l'écran de chargement BLK 
  if (loading) return <LoadingScreen />;

  return (
    <>
      {/* Si isSending est vrai (pendant l'envoi du mail), on affiche l'overlay */}
      {isSending && <LoadingScreen />}

      <div className="h-[calc(100vh-80px)] overflow-y-auto bg-zinc-950 text-white flex flex-col items-center p-4"> 
         <div className="w-full max-w-xl mt-12">
          <Link 
            href={`/talents/${params.id}`} 
            className="inline-flex items-center text-yellow-500 hover:text-white transition-colors mb-8 font-bold uppercase tracking-tighter"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Retour au profil
          </Link>

          <div className="bg-zinc-900 border border-yellow-500 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">
              Contacter {talent.first_name}
            </h1>
            <p className="text-zinc-500 text-sm mb-8 italic">
              Votre message sera transmis directement à son adresse mail professionnelle.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">Votre Nom / Entité</label>
                  <input name="senderName" required type="text" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" placeholder="Nom ou Agence" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">Votre Email de contact</label>
                  <input name="senderEmail" required type="email" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" placeholder="votre@email.com" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">Objet du message</label>
                <input name="subject" required type="text" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" placeholder="Ex: Booking / Collaboration" />
              </div>

              <div>
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">Message</label>
                <textarea name="message" required className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 h-40 resize-none placeholder:text-zinc-800" placeholder="Détaillez votre proposition..."></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase tracking-tighter shadow-lg shadow-yellow-500/20 disabled:opacity-50"
              >
                {isSending ? "ENVOI EN COURS..." : "ENVOYER LA PROPOSITION"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}