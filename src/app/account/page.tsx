import { Suspense } from "react";
import AccountClient from "./AccountClient";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-12 text-sm">Загрузка…</div>}>
      <AccountClient />
    </Suspense>
  );
}
