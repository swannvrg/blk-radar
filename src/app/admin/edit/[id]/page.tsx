import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EditTalentClientWrapper from "./EditTalentClientWrapper";
export default async function EditTalentPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: talent } = await supabase
    .from("talents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!talent) return notFound();

  // On passe les données au composant Client
  return <EditTalentClientWrapper talent={talent} />;
}