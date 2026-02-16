import Link from "next/link";
import { prisma } from "../lib/prisma";

export default async function PublicBooksPage() {
    const [books, categories] = await Promise.all([
        prisma.book.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.category.findMany({
            include: { _count: { select: { books: true } } },
            orderBy: { name: "asc" },
        }),
    ]);

    const totalStock = books.reduce((sum, book) => sum + book.stock, 0);
    const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

    return (
        <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Katalog Publik
                        </p>
                        <h1 className="text-3xl font-bold">Daftar Buku & Kategori</h1>
                        <p className="max-w-2xl text-sm text-zinc-600">
                            Jelajahi koleksi buku dan kategori yang tersedia. Login untuk mengelola data.
                        </p>
                    </div>
                    <Link
                        href="/api/auth/signin?callbackUrl=/dashboard"
                        className="inline-flex items-center justify-center rounded-3xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        Login
                    </Link>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Buku</p>
                        <p className="mt-2 text-2xl font-semibold text-zinc-900">{books.length}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Kategori</p>
                        <p className="mt-2 text-2xl font-semibold text-zinc-900">{categories.length}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Stok</p>
                        <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalStock}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                            <h2 className="text-lg font-semibold">Daftar Buku</h2>
                        </div>
                        <div className="overflow-x-auto">
                            {books.length === 0 ? (
                                <div className="px-6 py-10 text-sm text-zinc-500">Belum ada data buku.</div>
                            ) : (
                                <table className="w-full min-w-170 border-collapse text-left text-sm">
                                    <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600">
                                        <tr>
                                            <th className="px-6 py-4">Judul</th>
                                            <th className="px-6 py-4">Penulis</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4 text-right">Stok</th>
                                            <th className="px-6 py-4">Update Terakhir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((book) => (
                                            <tr key={book.id} className="border-t border-zinc-200">
                                                <td className="px-6 py-4 font-medium text-zinc-900">{book.title}</td>
                                                <td className="px-6 py-4 text-zinc-600">{book.author}</td>
                                                <td className="px-6 py-4 text-zinc-600">{book.category.name}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                                                    {book.stock}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">
                                                    {dateFormatter.format(book.updatedAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        <div className="border-b border-zinc-200 px-6 py-4">
                            <h2 className="text-lg font-semibold">Kategori Buku</h2>
                        </div>
                        <div className="px-6 py-4">
                            {categories.length === 0 ? (
                                <div className="text-sm text-zinc-500">Belum ada kategori.</div>
                            ) : (
                                <ul className="grid gap-3">
                                    {categories.map((category) => (
                                        <li
                                            key={category.id}
                                            className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {category.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">{category._count.books} buku</p>
                                            </div>
                                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                                {category._count.books}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
