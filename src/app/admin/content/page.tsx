import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";
import { ContentForms } from "@/components/ContentForms";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const [settings, faqs, certs] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.certificate.findMany({ orderBy: { number: "asc" } }),
  ]);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">Тексты и FAQ</h1>
      <ContentForms map={map} faqs={faqs} certs={certs} />
    </div>
  );
}
