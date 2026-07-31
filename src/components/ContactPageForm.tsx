"use client";

import { LeadForm } from "@/components/LeadForm";

export function ContactPageForm() {
  return <LeadForm variant="contact" source="contacts_page" className="mt-8 max-w-xl border border-[var(--line)] bg-white p-5" />;
}
