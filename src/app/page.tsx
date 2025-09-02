import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="flex flex-col items-center gap-4 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <Link href="/">Aercel</Link>
            <Link href="/dashboard">Dashboard</Link>
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
