import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("is_paid, is_architect")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isArchitect =
    (profile as { is_architect?: boolean } | null)?.is_architect ?? false;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Subscription</h1>
        <p className="text-gray-500 mt-1 text-sm">Your current plan and subscription details.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-500">Current plan</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isArchitect
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            {isArchitect ? "Architect" : "Free"}
          </span>
        </div>

        {isArchitect && (
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "Pipeline Dashboard",
              "Application Timeline & Calendar",
              "Client Portal",
              "Email Templates",
              "All Planning Tools",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <p className="text-sm text-blue-700">
          To manage your subscription, contact{" "}
          <a href="mailto:hello@granted.ie?subject=Subscription" className="font-semibold underline">
            hello@granted.ie
          </a>
          .
        </p>
      </div>
    </div>
  );
}
