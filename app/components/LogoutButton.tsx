"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-body-responsive inline-flex items-center justify-center rounded-3xl bg-zinc-400 px-4 py-2 font-semibold text-white hover:bg-green-700 absolute right-6 top-6 gap-2"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>Logout</span>
    </button>
  );
}
