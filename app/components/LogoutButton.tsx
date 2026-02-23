"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center justify-center gap-2 rounded-3xl bg-zinc-400 px-4 py-2 text-white hover:bg-zinc-500"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>Logout</span>
    </button>
  );
}
