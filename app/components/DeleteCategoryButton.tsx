"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import type { CategoryItem } from "../types/dashboard";

type DeleteCategoryButtonProps = {
    category: Pick<CategoryItem, "id" | "name">;
    onSubmit: (categoryId: number) => Promise<void>;
};

export default function DeleteCategoryButton({ category, onSubmit }: DeleteCategoryButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        await onSubmit(category.id).finally(() => setIsLoading(false));
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border bg-red-600 px-4 py-2 text-white shadow-sm transition hover:bg-red-700"
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-medium">Hapus</span>
            </button>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900">Hapus Kategori</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Hapus kategori dari database. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <form
                            className="mt-6 grid gap-4"
                            onSubmit={handleSubmit}
                        >
                            <label className="grid gap-2 text-sm font-medium text-zinc-700">
                                Apakah Anda yakin ingin menghapus kategori <span className="font-semibold">{category.name}?</span>
                            </label>
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl bg-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-400"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    Hapus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
