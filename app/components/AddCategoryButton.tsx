"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CategoryFormPayload } from "../types/dashboard";

type AddCategoryButtonProps = {
  onSubmit: (data: CategoryFormPayload) => Promise<void>;
};

export default function AddCategoryButton({
  onSubmit,
}: AddCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      categoryName: formData.get("categoryName") as string,
    };

    await onSubmit(data).finally(() => setIsLoading(false));
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border bg-green-600 px-4 py-2 text-white shadow-sm transition hover:bg-green-700"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="font-medium">Tambah Kategori</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Tambah Kategori
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Isi data kategori baru sebelum disimpan ke database.
                </p>
              </div>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Nama Kategori
                <input
                  name="categoryName"
                  type="text"
                  required
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="Contoh: Teknologi"
                />
              </label>
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
