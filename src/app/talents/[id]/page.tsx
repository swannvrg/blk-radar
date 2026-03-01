import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image"; // Assuming you have a Supabase database types file

import TalentProfileClient from "../../../components/TalentProfile";
import Footer from "@/components/Footer";

interface TalentPageProps {
  params: { id: string };
}

// Define a simplified Talent interface for display, including new fields
interface TalentForDisplay {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  specialty?: string;
  interview_url?: string;
  image_url?: string;
  project_description?: string;
  needs?: string;
  goals?: string;
  social_links?: any;
}

export default async function TalentPage({ params }: TalentPageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Géré par le middleware
          }
        },
      },
    },
  );

  const { id } = params;

  // Fetch talent data from Supabase, including the new interview_url
  const { data: talent, error } = await supabase
    .from("talents")
    .select("*") // Utilise "*" pour être sûr de TOUT récupérer sans exception
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching talent:", error);
  }

  if (!talent) {
    notFound();
  }
  // Check if the user is an admin (simplified for this example)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin email or role check

  return (
  <>
    {/* Suppression du h-[calc(100vh-80px)] qui bloque le scroll naturel */}
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <div className="w-full">
        <TalentProfileClient
          talent={talent as TalentForDisplay}
          isAdmin={isAdmin}
          currentUser={user}
        />
      </div>
      <Footer />
    </div>
  </>
);
}
