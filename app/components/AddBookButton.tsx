"use client";

import { useEffect, useState } from "react";
import { Plus, Upload, FileImage } from "lucide-react";
import type { BookCategory, CreateBookFormPayload } from "../types/dashboard";

type AddBookButtonProps = {
  onSubmit: (data: CreateBookFormPayload) => Promise<void>;
};

export default function AddBookButton({ onSubmit }: AddBookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [fileName, setFileName] = useState("Belum ada file dipilih");
  const [image, setImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      setCategoryError("");

      try {
        const response = await fetch(`/api/admin/categories`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil kategori");
        }

        const result = await response.json();
        setCategories(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        setCategoryError(
          err instanceof Error ? err.message : "Terjadi kesalahan",
        );
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const handleFileSelect = (file: File) => {
    setImage(file);
    setFileName(file.name);
    setUploadError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");

    if (!image) {
      setUploadError("Gambar wajib diunggah");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        title,
        author,
        categoryId,
        stock: Number(stock),
        image,
      });

      handleCloseModal();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal menambah buku",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setImage(null);
    setFileName("Belum ada file dipilih");
    setUploadError("");
    setTitle("");
    setAuthor("");
    setCategoryId("");
    setStock("");
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
        <span className="text-sm md:text-base lg:text-lg">Buku</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base md:text-lg lg:text-xl  font-semibold text-zinc-900">
                  Tambah Buku
                </h2>
                <p className="mt-1 text-xs md:text-sm lg:text-base text-zinc-500">
                  Isi data buku baru sebelum disimpan ke database.
                </p>
              </div>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <label className="grid gap-2 text-xs md:text-sm lg:text-base text-zinc-700">
                Gambar
                <input
                  id="book-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  className={`rounded-2xl border-2 border-dashed bg-zinc-100 px-6 py-8 text-center transition ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-300"
                  }`}
                >
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 text-blue-500">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs md:text-sm lg:text-base text-zinc-700">
                    Pilih file atau drag and drop
                  </p>
                  <label
                    htmlFor="book-image"
                    className="inline-flex w-fit cursor-pointer items-center gap-1 px-3 py-2 text-xs md:text-sm lg:text-base text-zinc-700 hover:bg-zinc-100"
                  >
                    <div className="h-4 w-4" aria-hidden="true">
                      {image ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-4 w-4"
                        />
                      ) : (
                        <FileImage className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-1 text-xs md:text-sm lg:text-base text-zinc-500">
                      {fileName}
                    </div>
                  </label>
                </div>
                {uploadError && (
                  <span className="text-xs font-normal text-red-600">
                    {uploadError}
                  </span>
                )}
              </label>

              <label className="grid gap-2 text-xs md:text-sm lg:text-base text-zinc-700">
                Judul Buku
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs md:text-sm lg:text-base text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="Contoh: Clean Code"
                />
              </label>
              <label className="grid gap-2 text-xs md:text-sm lg:text-base text-zinc-700">
                Penulis
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs md:text-sm lg:text-base text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="Contoh: Robert C. Martin"
                />
              </label>
              <label className="grid gap-2 text-xs md:text-sm lg:text-base text-zinc-700">
                Kategori
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs md:text-sm lg:text-base text-zinc-900 focus:border-green-600 focus:outline-none"
                  disabled={isCategoryLoading || categories.length === 0}
                >
                  <option value="" disabled>
                    {isCategoryLoading
                      ? "Memuat kategori..."
                      : "Pilih kategori"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryError && (
                  <span className="text-xs font-normal text-red-600">
                    {categoryError}
                  </span>
                )}
              </label>
              <label className="grid gap-2 text-xs md:text-sm lg:text-base text-zinc-700">
                Stok
                <input
                  type="number"
                  min={0}
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs md:text-sm lg:text-base text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="0"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs md:text-sm lg:text-base text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-green-600 px-4 py-2 text-xs md:text-sm lg:text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
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
