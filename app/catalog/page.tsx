"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Book, Category } from "../types/catalog";

export default function PublicBooksPage() {
  const bookPageSize = 5;
  const categoryPageSize = 5;
  const [bookPage, setBookPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBookCount, setTotalBookCount] = useState(0);
  const [totalCategoryCount, setTotalCategoryCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [bookTotalPages, setBookTotalPages] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogData = async () => {
    const controller = new AbortController();

    try {
      const [booksResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/books?page=${bookPage}&pageSize=${bookPageSize}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Basic ${btoa(
              `${process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME}:${process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD}`,
            )}`,
          },
        }),
        fetch(
          `/api/categories?page=${categoryPage}&pageSize=${categoryPageSize}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Basic ${btoa(
                `${process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME}:${process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD}`,
              )}`,
            },
          },
        ),
      ]);

      if (!booksResponse.ok || !categoriesResponse.ok) {
        throw new Error("Gagal memuat data katalog");
      }

      const booksResult = await booksResponse.json();
      const categoriesResult = await categoriesResponse.json();

      if (controller.signal.aborted) {
        return;
      }

      setBooks(booksResult.data ?? []);
      setCategories(categoriesResult.data ?? []);
      setTotalBookCount(booksResult.meta?.total ?? 0);
      setTotalCategoryCount(categoriesResult.meta?.total ?? 0);
      setTotalStock(booksResult.meta?.totalStock ?? 0);
      setBookTotalPages(booksResult.meta?.totalPages ?? 1);
      setCategoryTotalPages(categoriesResult.meta?.totalPages ?? 1);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError("Terjadi kesalahan saat mengambil data dashboard.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
      return () => {
        controller.abort();
      };
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, [bookPage, categoryPage]);
  const getPageNumbers = (current: number, total: number) => {
    const maxButtons = 5;
    const start = Math.max(1, Math.min(current - 2, total - maxButtons + 1));
    const end = Math.min(total, start + maxButtons - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  };
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  });

  return (
    <section className="page-responsive relative flex min-h-screen flex-col gap-6 bg-zinc-50 text-zinc-900">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-base md:text-lg lg:text-xl font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Katalog Publik
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Daftar Buku & Kategori
          </h1>
        </div>
        <Link
          href="/auth/signin?callbackUrl=/dashboard"
          className="text-sm md:text-base lg:text-lg inline-flex items-center justify-center rounded-3xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 absolute right-6 top-6"
        >
          Login
        </Link>
      </header>

      {error ? (
        <div className="text-sm md:text-base lg:text-lg  rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="catalog-stats-grid">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs md:text-sm lg:text-base font-semibold uppercase tracking-wide text-zinc-500">
            <span className="block sm:inline">Total</span>
            <span className="block sm:ml-1 sm:inline">Buku</span>
          </p>
          <p className="text-base md:text-lg lg:text-xl mt-2 font-semibold text-zinc-900">
            {totalBookCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs md:text-sm lg:text-base font-semibold uppercase tracking-wide text-zinc-500">
            Total Kategori
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-2 font-semibold text-zinc-900">
            {totalCategoryCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs md:text-sm lg:text-base font-semibold uppercase tracking-wide text-zinc-500">
            <span className="block sm:inline">Total</span>
            <span className="block sm:ml-1 sm:inline">Stok</span>
          </p>
          <p className="text-sm md:text-base lg:text-lg mt-2 font-semibold text-zinc-900">
            {totalStock}
          </p>
        </div>
      </div>
      <div className="catalog-content-grid">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold">
              Daftar Buku
            </h2>
          </div>
          <div className="catalog-books-scroll">
            {!isLoading && books.length === 0 ? (
              <div className="text-sm md:text-base lg:text-lg  px-6 py-10 text-zinc-500">
                Belum ada data buku.
              </div>
            ) : (
              <table className="catalog-books-table text-sm md:text-base lg:text-lg  w-full border-collapse text-left">
                <thead className="text-xs md:text-sm lg:text-base bg-zinc-100 uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th className="px-6 py-4">Gambar</th>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4 text-right">Stok</th>
                    <th className="px-6 py-4 ">Update Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t border-zinc-200">
                      <td className="px-6 py-4 text-xs md:text-sm lg:text-base text-zinc-900">
                        {book.image?.path ? (
                          <img
                            src={book.image.path}
                            alt={book.title}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-zinc-200"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm lg:text-base text-zinc-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm lg:text-base text-zinc-600">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm lg:text-base text-zinc-600">
                        {book.category?.name}
                      </td>
                      <td className="px-6 py-4 text-right text-xs md:text-sm lg:text-base text-zinc-900">
                        {book.stock}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-sm lg:text-base text-zinc-600">
                        {dateFormatter.format(new Date(book.updatedAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {books.length > 0 && bookTotalPages > 1 ? (
            <div className="text-xs md:text-sm lg:text-base  flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-zinc-600 gap-2">
              <span>
                Halaman {bookPage} dari {bookTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookPage((prev) => prev - 1)}
                  className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                    bookPage === 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                  disabled={bookPage === 1}
                >
                  Prev
                </button>
                {getPageNumbers(bookPage, bookTotalPages).map((pageNumber) => (
                  <button
                    type="button"
                    key={`book-page-${pageNumber}`}
                    onClick={() => setBookPage(pageNumber)}
                    aria-current={pageNumber === bookPage ? "page" : undefined}
                    className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                      pageNumber === bookPage
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                    }`}
                    disabled={pageNumber === bookPage}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBookPage((prev) => prev + 1)}
                  className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                    bookPage === bookTotalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                  disabled={bookPage === bookTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="catalog-category-panel rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold">
              Kategori Buku
            </h2>
          </div>
          <div className="px-6 py-4">
            {!isLoading && categories.length === 0 ? (
              <div className="text-sm md:text-base lg:text-lg  text-zinc-500">
                Belum ada kategori.
              </div>
            ) : (
              <ul className="grid gap-3">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs md:text-sm lg:text-base  text-zinc-900">
                        {category.name}
                      </p>
                      <p className="text-xs md:text-sm lg:text-base text-zinc-500">
                        {category._count.books} buku
                      </p>
                    </div>
                    <span className="text-xs md:text-sm lg:text-base rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-600">
                      {category._count.books}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {categories.length > 0 && categoryTotalPages > 1 ? (
            <div className="text-sm md:text-base lg:text-lg  flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-zinc-600">
              <span>
                Halaman {categoryPage} dari {categoryTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryPage((prev) => prev - 1)}
                  className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                    categoryPage === 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                  disabled={categoryPage === 1}
                >
                  Prev
                </button>
                {getPageNumbers(categoryPage, categoryTotalPages).map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={`category-page-${pageNumber}`}
                      onClick={() => setCategoryPage(pageNumber)}
                      aria-current={
                        pageNumber === categoryPage ? "page" : undefined
                      }
                      className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                        pageNumber === categoryPage
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                      }`}
                      disabled={pageNumber === categoryPage}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setCategoryPage((prev) => prev + 1)}
                  className={`text-xs md:text-sm lg:text-base rounded-full border px-3 py-1 font-semibold ${
                    categoryPage === categoryTotalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                  disabled={categoryPage === categoryTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
