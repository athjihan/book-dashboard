"use client";

import { useEffect, useRef, useState } from "react";
import AddBookButton from "../components/AddBookButton";
import LogoutButton from "../components/LogoutButton";
import EditBookButton from "../components/EditBookButton";
import DeleteBookButton from "../components/DeleteBookButton";
import EditCategoryButton from "../components/EditCategoryButton";
import DeleteCategoryButton from "../components/DeleteCategoryButton";
import AddCategoryButton from "../components/AddCategoryButton";
import type {
  BookFormPayload,
  BookItem,
  CategoryFormPayload,
  CategoryItem,
  PaginatedResponse,
} from "../types/dashboard";

export default function DashboardPage() {
  const bookPageSize = 5;
  const categoryPageSize = 5;
  const [bookPage, setBookPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalBookCount, setTotalBookCount] = useState(0);
  const [totalCategoryCount, setTotalCategoryCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [bookTotalPages, setBookTotalPages] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddBook = async (data: BookFormPayload) => {
    try {
      const response = await fetch(`/api/user/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Gagal menyimpan buku");
      }

      fetchDashboardData();
    } catch (error) {
      setError("Gagal menyimpan buku");
    }
  };

  const handleEditBook = async (bookId: number, data: BookFormPayload) => {
    try {
      const response = await fetch(`/api/user/books`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: bookId }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui data buku");
      }

      fetchDashboardData();
    } catch (error) {
      setError("Gagal memperbarui buku");
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      const response = await fetch("/api/user/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookId }),
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus buku");
      }

      fetchDashboardData();
      setBookPage(1);
    } catch (error) {
      setError("Gagal menghapus buku");
    }
  };

  const handleAddCategory = async (data: CategoryFormPayload) => {
    try {
      const response = await fetch("/api/user/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan kategori");
      }

      fetchDashboardData();
    } catch (error) {
      setError("Gagal menyimpan kategori");
    }
  };

  const handleEditCategory = async (
    categoryId: number,
    data: CategoryFormPayload,
  ) => {
    try {
      const response = await fetch("/api/user/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: categoryId }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan kategori");
      }

      fetchDashboardData();
    } catch (error) {
      setError("Gagal memperbarui kategori");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch("/api/user/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus kategori");
      }

      fetchDashboardData();
      setCategoryPage(1);
    } catch (error) {
      setError("Gagal menghapus kategori");
    }
  };

  const fetchDashboardData = async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const [booksResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/user/books?page=${bookPage}&pageSize=${bookPageSize}`, {
          signal: controller.signal,
        }),
        fetch(
          `/api/user/categories?page=${categoryPage}&pageSize=${categoryPageSize}`,
        ),
      ]);

      if (!booksResponse.ok || !categoriesResponse.ok) {
        throw new Error("Gagal mengambil data dashboard");
      }

      const booksResult: PaginatedResponse<BookItem> =
        await booksResponse.json();
      const categoriesResult: PaginatedResponse<CategoryItem> =
        await categoriesResponse.json();

      if (controller.signal.aborted) {
        return;
      }

      const nextBooks = booksResult.data ?? [];
      setBooks(nextBooks);
      setCategories(categoriesResult.data ?? []);
      setTotalBookCount(booksResult.meta?.total ?? 0);
      setTotalCategoryCount(categoriesResult.meta?.total ?? 0);
      setTotalStock(
        booksResult.meta?.totalStock ??
          nextBooks.reduce((sum, book) => sum + book.stock, 0),
      );
      setBookTotalPages(Math.max(1, booksResult.meta?.totalPages ?? 1));
      setCategoryTotalPages(
        Math.max(1, categoriesResult.meta?.totalPages ?? 1),
      );
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
    fetchDashboardData();
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
      <div className="absolute right-6 top-6">
        <LogoutButton />
      </div>
      <header className="space-y-2">
        <p className="text-small-responsive font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Dashboard
        </p>
        <h1 className="text-title-responsive font-bold text-zinc-900">
          Daftar Buku
        </h1>
      </header>

      {error ? (
        <div className="text-body-responsive font-medium rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="catalog-stats-grid">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-small-responsive font-semibold uppercase tracking-wide text-zinc-500">
            <span className="block sm:inline">Total</span>
            <span className="block sm:ml-1 sm:inline">Buku</span>
          </p>
          <p className="text-subtitle-responsive mt-2 font-semibold text-zinc-900">
            {totalBookCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-small-responsive font-semibold uppercase tracking-wide text-zinc-500">
            Total Kategori
          </p>
          <p className="text-subtitle-responsive mt-2 font-semibold text-zinc-900">
            {totalCategoryCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-small-responsive font-semibold uppercase tracking-wide text-zinc-500">
            <span className="block sm:inline">Total</span>
            <span className="block sm:ml-1 sm:inline">Stok</span>
          </p>
          <p className="text-subtitle-responsive mt-2 font-semibold text-zinc-900">
            {totalStock}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AddBookButton onSubmit={handleAddBook} />
          <AddCategoryButton onSubmit={handleAddCategory} />
        </div>
      </div>

      <div className="catalog-content-grid">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="catalog-books-scroll">
            {!isLoading && books.length === 0 ? (
              <div className="text-body-responsive font-medium px-6 py-10 text-zinc-500">
                Belum ada data buku.
              </div>
            ) : (
              <table className="catalog-books-table text-body-responsive font-medium w-full border-collapse text-left">
                <thead className="text-small-responsive bg-zinc-100 uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4 text-right">Stok</th>
                    <th className="px-6 py-4">Update Terakhir</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t border-zinc-200">
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{book.author}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        {book.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-900">
                        {book.stock}
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {dateFormatter.format(new Date(book.updatedAt))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <EditBookButton
                            book={book}
                            onSubmit={handleEditBook}
                          />
                          <DeleteBookButton
                            book={book}
                            onSubmit={handleDeleteBook}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {books.length > 0 && bookTotalPages > 1 ? (
            <div className="text-body-responsive font-medium flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-zinc-600">
              <span>
                Halaman {bookPage} dari {bookTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookPage((prev) => prev - 1)}
                  className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                    bookPage === 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  Prev
                </button>
                {getPageNumbers(bookPage, bookTotalPages).map((pageNumber) => (
                  <button
                    key={`book-page-${pageNumber}`}
                    onClick={() => setBookPage(pageNumber)}
                    aria-current={pageNumber === bookPage ? "page" : undefined}
                    className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                      pageNumber === bookPage
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setBookPage((prev) => prev + 1)}
                  className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                    bookPage === bookTotalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <aside className="catalog-category-panel rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-subtitle-responsive font-semibold">
              Kategori Buku
            </h2>
          </div>
          <div className="px-6 py-4">
            {!isLoading && categories.length === 0 ? (
              <div className="text-body-responsive font-medium text-zinc-500">
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
                      <p className="text-body-responsive font-medium text-zinc-900">
                        {category.name}
                      </p>
                      <p className="text-small-responsive text-zinc-500">
                        {category._count.books} buku
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <EditCategoryButton
                        category={category}
                        onSubmit={handleEditCategory}
                      />
                      <DeleteCategoryButton
                        category={category}
                        onSubmit={handleDeleteCategory}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {categories.length > 0 && categoryTotalPages > 1 ? (
            <div className="text-body-responsive font-medium flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-zinc-600">
              <span>
                Halaman {categoryPage} dari {categoryTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCategoryPage((prev) => prev - 1)}
                  className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                    categoryPage === 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  Prev
                </button>
                {getPageNumbers(categoryPage, categoryTotalPages).map(
                  (pageNumber) => (
                    <button
                      key={`category-page-${pageNumber}`}
                      onClick={() => setCategoryPage(pageNumber)}
                      aria-current={
                        pageNumber === categoryPage ? "page" : undefined
                      }
                      className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                        pageNumber === categoryPage
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCategoryPage((prev) => prev + 1)}
                  className={`text-small-responsive rounded-full border px-3 py-1 font-semibold ${
                    categoryPage === categoryTotalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                  }`}
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
