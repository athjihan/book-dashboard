"use client";

import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import type { BookCategory, BookFormPayload, BookItem } from "../types/dashboard";

type EditBookButtonProps = {
    book: BookItem;
    onSubmit: (bookId: number, data: BookFormPayload) => Promise<void>;
};

export default function EditBookButton({ book, onSubmit }: EditBookButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
            const fetchCategories = async () => {
                setIsCategoryLoading(true);
                setCategoryError("");
    
                try {
                    const response = await fetch(`/api/user/categories`, {
                        method: "GET",
                        cache: "no-store",
                    });
    
                    if (!response.ok) {
                        throw new Error("Gagal mengambil kategori");
                    }
    
                    const result = await response.json()
                    setCategories(Array.isArray(result?.data) ? result.data : []);
                } catch (err) {
                    setCategoryError(err instanceof Error ? err.message : "Terjadi kesalahan");
                } finally {
                    setIsCategoryLoading(false);
                }
            };
    
            fetchCategories();
        }, [isOpen]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = {
            title: formData.get("title") as string,
            author: formData.get("author") as string,
            categoryId: Number(formData.get("categoryId")),
            stock: Number(formData.get("stock")),
        };

        try {
            await onSubmit(book.id, data);

            setIsOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <Edit className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-medium">Edit</span>
            </button>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900">Edit</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Ubah data buku sebelum disimpan ke database.
                                </p>
                            </div>
                        </div>

                        <form
                            className="mt-6 grid gap-4"
                            onSubmit={handleSubmit}
                        >
                            {error && (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <label className="grid gap-2 text-sm font-medium text-zinc-700">
                                Judul Buku
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none"
                                    placeholder="Contoh: Clean Code"
                                    defaultValue={book.title}
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-zinc-700">
                                Penulis
                                <input
                                    name="author"
                                    type="text"
                                    required
                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none"
                                    placeholder="Contoh: Robert C. Martin"
                                    defaultValue={book.author}
                                />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-zinc-700">
                                Kategori
                                <select
                                    name="categoryId"
                                    required
                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none"
                                    disabled={isCategoryLoading || categories.length === 0}
                                    defaultValue={book.category?.id || ""}
                                >
                                    <option value="" disabled>
                                        {isCategoryLoading ? "Memuat kategori..." : "Pilih kategori"}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category?.name}
                                        </option>
                                    ))}
                                </select>
                                {categoryError && (
                                    <span className="text-xs font-normal text-red-600">{categoryError}</span>
                                )}
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-zinc-700">
                                Stok
                                <input
                                    name="stock"
                                    type="number"
                                    min={0}
                                    required
                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none"
                                    placeholder="0"
                                    defaultValue={book.stock}
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
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
