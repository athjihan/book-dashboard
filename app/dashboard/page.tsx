import { prisma } from "../lib/prisma";
import AddBookButton from "../components/AddBookButton";
import LogoutButton from "../components/LogoutButton";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function BooksPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin?callbackUrl=%2Fdashboard");
    }

    const books = await prisma.book.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });

    const totalStock = books.reduce((sum, book) => sum + book.stock, 0);
    const categoryCount = new Set(books.map((book) => book.categoryId)).size;
    const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

    return (
        <section className="relative flex min-h-screen flex-col gap-6 bg-zinc-50 px-6 py-10 text-zinc-900">
            <div className="absolute right-6 top-6">
                <LogoutButton />
            </div>
            <header className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Dashboard
                </p>
                <h1 className="text-3xl font-bold text-zinc-900">Daftar Buku</h1>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Total Buku
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900">{books.length}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Total Kategori
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900">{categoryCount}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Total Stok
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalStock}</p>
                </div>
                <div className="flex items-center">
                    <AddBookButton />
                </div>

            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
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
        </section>
    );
}
