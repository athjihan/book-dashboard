import Link from "next/link";
import { prisma } from "../lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CatalogSearchParams = {
    bookPage?: string;
    categoryPage?: string;
};

export default async function PublicBooksPage({
    searchParams,
}: {
    searchParams?: Promise<CatalogSearchParams>;
}) {
    const resolvedSearchParams = await searchParams;
    noStore();
    const bookPageSize = 5;
    const categoryPageSize = 5;
    const bookPage = Math.max(
        1,
        Number(resolvedSearchParams?.bookPage ?? "1") || 1
    );
    const categoryPage = Math.max(
        1,
        Number(resolvedSearchParams?.categoryPage ?? "1") || 1
    );

    const [books, booksTotal, categories, categoriesTotal, stockAggregate] =
        await Promise.all([
            prisma.book.findMany({
                include: { category: true },
                orderBy: { createdAt: "desc" },
                skip: (bookPage - 1) * bookPageSize,
                take: bookPageSize,
            }),
            prisma.book.count(),
            prisma.category.findMany({
                include: { _count: { select: { books: true } } },
                orderBy: { name: "asc" },
                skip: (categoryPage - 1) * categoryPageSize,
                take: categoryPageSize,
            }),
            prisma.category.count(),
            prisma.book.aggregate({ _sum: { stock: true } }),
        ]);

    const totalStock = stockAggregate._sum.stock ?? 0;
    const totalBookCount = booksTotal;
    const totalCategoryCount = categoriesTotal;
    const bookTotalPages = Math.max(1, Math.ceil(booksTotal / bookPageSize));
    const categoryTotalPages = Math.max(
        1,
        Math.ceil(categoriesTotal / categoryPageSize)
    );
    const buildHref = (nextBookPage: number, nextCategoryPage: number) =>
        `?bookPage=${nextBookPage}&categoryPage=${nextCategoryPage}`;
    const getPageNumbers = (current: number, total: number) => {
        const maxButtons = 5;
        const start = Math.max(1, Math.min(current - 2, total - maxButtons + 1));
        const end = Math.min(total, start + maxButtons - 1);

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    };
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
                        <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalBookCount}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Kategori</p>
                        <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalCategoryCount}</p>
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
                        {books.length > 0 && bookTotalPages > 1 ? (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600">
                                <span>
                                    Halaman {bookPage} dari {bookTotalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={buildHref(Math.max(1, bookPage - 1), categoryPage)}
                                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                            bookPage === 1
                                                ? "pointer-events-none border-zinc-200 text-zinc-400"
                                                : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                        }`}
                                    >
                                        Prev
                                    </Link>
                                    {getPageNumbers(bookPage, bookTotalPages).map((pageNumber) => (
                                        <Link
                                            key={`book-page-${pageNumber}`}
                                            href={buildHref(pageNumber, categoryPage)}
                                            aria-current={pageNumber === bookPage ? "page" : undefined}
                                            className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                                pageNumber === bookPage
                                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                                    : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                            }`}
                                        >
                                            {pageNumber}
                                        </Link>
                                    ))}
                                    <Link
                                        href={buildHref(
                                            Math.min(bookTotalPages, bookPage + 1),
                                            categoryPage
                                        )}
                                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                            bookPage === bookTotalPages
                                                ? "pointer-events-none border-zinc-200 text-zinc-400"
                                                : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                        }`}
                                    >
                                        Next
                                    </Link>
                                </div>
                            </div>
                        ) : null}
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
                        {categories.length > 0 && categoryTotalPages > 1 ? (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600">
                                <span>
                                    Halaman {categoryPage} dari {categoryTotalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={buildHref(bookPage, Math.max(1, categoryPage - 1))}
                                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                            categoryPage === 1
                                                ? "pointer-events-none border-zinc-200 text-zinc-400"
                                                : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                        }`}
                                    >
                                        Prev
                                    </Link>
                                    {getPageNumbers(categoryPage, categoryTotalPages).map((pageNumber) => (
                                        <Link
                                            key={`category-page-${pageNumber}`}
                                            href={buildHref(bookPage, pageNumber)}
                                            aria-current={pageNumber === categoryPage ? "page" : undefined}
                                            className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                                pageNumber === categoryPage
                                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                                    : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                            }`}
                                        >
                                            {pageNumber}
                                        </Link>
                                    ))}
                                    <Link
                                        href={buildHref(
                                            bookPage,
                                            Math.min(categoryTotalPages, categoryPage + 1)
                                        )}
                                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                            categoryPage === categoryTotalPages
                                                ? "pointer-events-none border-zinc-200 text-zinc-400"
                                                : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                        }`}
                                    >
                                        Next
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </aside>
                </div>
            </section>
        </main>
    );
}
