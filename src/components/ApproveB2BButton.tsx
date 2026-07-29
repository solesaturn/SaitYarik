"use client";

import { useRouter } from "next/navigation";

export function ApproveB2BButton({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-primary mt-3 !py-1.5"
      onClick={async () => {
        await fetch("/api/admin/approve-b2b", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        router.refresh();
      }}
    >
      Одобрить опт
    </button>
  );
}
