import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, practice_name, county")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const fullName =
    (profile as { full_name?: string } | null)?.full_name ?? "";
  const practiceName =
    (profile as { practice_name?: string } | null)?.practice_name ?? "";
  const county =
    (profile as { county?: string } | null)?.county ?? "";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Your personal and practice details.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {[
          { label: "Full name",     value: fullName     || "—" },
          { label: "Practice name", value: practiceName || "—" },
          { label: "County",        value: county       || "—" },
          { label: "Email",         value: user?.email  || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <p className="text-sm text-blue-700">
          To update your profile details, contact{" "}
          <a href="mailto:hello@granted.ie" className="font-semibold underline">
            hello@granted.ie
          </a>
          .
        </p>
      </div>
    </div>
  );
}
