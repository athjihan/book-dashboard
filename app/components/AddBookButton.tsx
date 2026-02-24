"use client";

import { useEffect, useState } from "react";
import { FileImage, Plus } from "lucide-react";
import type { BookCategory, BookFormPayload } from "../types/dashboard";

type AddBookButtonProps = {
  onSubmit: (data: BookFormPayload) => Promise<void>;
};

export default function AddBookButton({ onSubmit }: AddBookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [fileName, setFileName] = useState("Belum ada file dipilih");
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

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
        const response = await fetch(`/api/user/categories`, {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileImage(file);
      setFileName(file.name);
      setUploadError("");
      return;
    }

    setSelectedFile(null);
    setFileImage(null);
    setFileName("Belum ada file dipilih");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");

    if (!selectedFile) {
      setUploadError("Gambar wajib diunggah");
      return;
    }

    setIsLoading(true);

    try {
      let uploadedPath: string;
      let uploadedName: string;

      // upload file jika ada -> biar dpt path

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || "Gagal upload gambar");
      }

      const uploadData = await uploadRes.json();
      uploadedPath = uploadData.data.path;
      uploadedName = uploadData?.data?.name;

      const data: BookFormPayload = {
        title: title,
        author: author,
        categoryId: categoryId,
        stock: Number(stock),
        imagePath: uploadedPath || "",
        imageName: uploadedName || "",
      };

      await onSubmit(data);
      setIsOpen(false);
      setSelectedFile(null);
      setFileImage(null);
      setFileName("Belum ada file dipilih");
      setTitle("");
      setAuthor("");
      setCategoryId("");
      setStock("");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setFileImage(null);
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
        <span className="text-body-responsive">Buku</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="md:text-sm font-semibold text-zinc-900">
                  Tambah Buku
                </h2>
                <p className="mt-1 text-small-responsive text-zinc-500">
                  Isi data buku baru sebelum disimpan ke database.
                </p>
              </div>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <label className="grid gap-2 text-small-responsive text-zinc-700">
                Gambar
                <input
                  id="book-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="book-image"
                  className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-small-responsive text-zinc-700 hover:bg-zinc-100"
                >
                  <div className="h-4 w-4" aria-hidden="true">
                    {fileImage ? (
                      <img
                        src={URL.createObjectURL(fileImage)}
                        alt="Preview"
                        className="h-4 w-4"
                      />
                    ) : (
                      <FileImage className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{fileName}</div>
                </label>
                {uploadError && (
                  <span className="text-xs font-normal text-red-600">
                    {uploadError}
                  </span>
                )}
              </label>

              <label className="grid gap-2 text-small-responsive text-zinc-700">
                Judul Buku
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-small-responsive text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="Contoh: Clean Code"
                />
              </label>
              <label className="grid gap-2 text-small-responsive text-zinc-700">
                Penulis
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-small-responsive text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="Contoh: Robert C. Martin"
                />
              </label>
              <label className="grid gap-2 text-small-responsive text-zinc-700">
                Kategori
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-small-responsive text-zinc-900 focus:border-green-600 focus:outline-none"
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
              <label className="grid gap-2 text-small-responsive text-zinc-700">
                Stok
                <input
                  type="number"
                  min={0}
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-small-responsive text-zinc-900 focus:border-green-600 focus:outline-none"
                  placeholder="0"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-small-responsive text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-green-600 px-4 py-2 text-small-responsive font-semibold text-white hover:bg-green-700 disabled:opacity-50"
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
