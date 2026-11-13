import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Deadline Keeper</h1>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        Vos échéances importantes au même endroit, avec un rappel avant chaque date limite.
      </p>
      <Link
        href="/deadlines"
        className="mt-6 inline-block w-full rounded-md bg-zinc-900 px-4 py-2 text-center font-medium text-white sm:w-auto dark:bg-zinc-100 dark:text-zinc-900"
      >
        Mes échéances
      </Link>
    </main>
  );
}
