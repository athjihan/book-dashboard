import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="text-title-responsive font-bold text-black dark:text-white">
          Welcome to the Book Dashboard
        </h1>
        <p className="mt-4 text-subtitle-responsive text-zinc-600 dark:text-zinc-400">
          Manage your books and collections with ease.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center justify-center rounded-3xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Go to Catalog
        </Link>
      </div>
    </div>
  );
}
