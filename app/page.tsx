import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">
          Selamat datang di Dasbor Buku!
        </h1>
        <p className="mt-4 text-base md:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400">
          Kelola koleksi buku Anda dengan mudah dan efisien.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center justify-center rounded-3xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Jelajahi Katalog
        </Link>
      </div>
    </div>
  );
}
