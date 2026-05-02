import { Suspense } from "react";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { FeaturedCafes } from "./featured-cafes";
import { CafeCardSkeleton } from "@/components/cafe-card-skeleton";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 relative">
      <Image
        src="/cardamomBun.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden sm:block fixed top-20 left-12 z-[-1]"
      />
      <Image
        src="/hotMatchaLatte.png"
        alt="decoration"
        width={120}
        height={120}
        className="hidden sm:block fixed bottom-1/2 left-8 z-[-1]"
      />
      <Image
        src="/swanLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden sm:block fixed top-15 right-10 z-[-1]"
      />
      <Image
        src="/icedMatchaLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden sm:block fixed top-1/3 right-5 z-[-1]"
      />
      <Image
        src="/icedLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden sm:block fixed bottom-1/4 left-20 z-[-1]"
      />
      <Image
        src="/hotLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden sm:block fixed bottom-1/4 right-14 z-[-1]"
      />
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <div className="text-center px-4">
          <h1 className="font-bold tracking-tight text-gray-900 text-7xl font-kate">
            <span className="font-light">Welcome to</span>{" "}
            <span className="font-bold">fika</span>
          </h1>
          <p className="mt-6 text-2xl leading-8 text-black font-kate">
            All the best coffee and work spots, all in one place.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-10 max-w-7xl p-5">
          <Suspense
            fallback={
              <section className="flex flex-col gap-6">
                <h2 className="text-2xl mb-4">Featured Cafes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <CafeCardSkeleton size="large" />
                  <CafeCardSkeleton size="large" />
                  <CafeCardSkeleton size="large" />
                </div>
              </section>
            }
          >
            <FeaturedCafes />
          </Suspense>
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
