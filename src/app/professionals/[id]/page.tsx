"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import {
  type Professional,
  PROFESSION_LABELS,
  PROFESSION_COLORS,
  SPECIALISM_LABELS,
} from "@/lib/professionals";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [pro, setPro]       = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/professionals/${id}`)
      .then(r => r.json())
      .then((data: { professional?: Professional; error?: string }) => {
        if (data.professional) setPro(data.professional);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="h-24 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !pro) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-sm mb-4">This professional listing could not be found.</p>
          <Link href="/find-a-professional" className="text-sm font-semibold text-green-600 hover:text-green-700 underline underline-offset-2">
            Back to directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const profLabel = PROFESSION_LABELS[pro.profession_type] ?? pro.profession_type;
  const profColor = PROFESSION_COLORS[pro.profession_type] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">

        {/* Back */}
        <Link
          href="/find-a-professional"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to directory
        </Link>

        {/* Profile card */}
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
          pro.is_featured ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"
        }`}>

          {pro.is_featured && (
            <div className="bg-green-600 px-5 py-2">
              <p className="text-xs font-semibold text-white">Featured listing</p>
            </div>
          )}

          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {pro.practice_name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{pro.name}</p>
              </div>
              {pro.is_verified && (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">Verified</span>
                </div>
              )}
            </div>

            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border mt-4 ${profColor}`}>
              {profLabel}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-7">

            {/* Bio */}
            {pro.bio && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{pro.bio}</p>
              </div>
            )}

            {/* Counties */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Counties Covered</h2>
              <div className="flex flex-wrap gap-1.5">
                {pro.counties.map(c => (
                  <span key={c} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>

            {/* Specialisms */}
            {pro.specialisms.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Project Specialisms</h2>
                <div className="flex flex-wrap gap-1.5">
                  {pro.specialisms.map(s => (
                    <span key={s} className="text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
                      {SPECIALISM_LABELS[s as keyof typeof SPECIALISM_LABELS] ?? s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h2>
              <div className="space-y-3">
                {pro.email && (
                  <a
                    href={`mailto:${pro.email}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    {pro.email}
                  </a>
                )}
                {pro.phone && (
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    {pro.phone}
                  </a>
                )}
                {pro.website && (
                  <a
                    href={pro.website.startsWith("http") ? pro.website : `https://${pro.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <span className="truncate">
                      {pro.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* CTA footer */}
          {pro.email && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <a
                href={`mailto:${pro.email}?subject=Planning enquiry via Planr`}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Send enquiry
              </a>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
