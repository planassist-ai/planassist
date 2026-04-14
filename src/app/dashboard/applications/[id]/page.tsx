import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "./ApplicationDetail";

interface Props {
  params: { id: string };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  return <ApplicationDetail app={data as Record<string, unknown>} />;
}
