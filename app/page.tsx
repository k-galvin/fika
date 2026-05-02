import { Suspense } from "react";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { FeaturedCafes } from "./featured-cafes";
import { CafeCardSkeleton } from "@/components/cafe-card-skeleton";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 relative">
      {/* Accent Images - Symmetrical Side Layout */}
      
      {/* Row 1 */}
      <Image
        src="/cardamomBun.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden lg:block absolute top-[5vh] left-10 z-[-1]"
      />
      <Image
        src="/hotMatchaLatte.png"
        alt="decoration"
        width={100}
        height={100}
        className="hidden lg:block absolute top-[5vh] right-10 z-[-1]"
      />

      {/* Row 2 */}
      <Image
        src="/icedLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden lg:block absolute top-[30vh] left-14 z-[-1]"
      />
      <Image
        src="/hotLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden lg:block absolute top-[30vh] right-14 z-[-1]"
      />

      {/* Row 3 */}
      <Image
        src="/cakeSlice.png"
        alt="decoration"
        width={110}
        height={110}
        className="hidden lg:block absolute top-[55vh] left-10 z-[-1]"
      />
      <Image
        src="/swanLatte.png"
        alt="decoration"
        width={96}
        height={96}
        className="hidden lg:block absolute top-[55vh] right-10 z-[-1]"
      />

      <div className="flex-1 w-full flex flex-col gap-10 items-center pt-0">
        <div className="flex-1 flex flex-col gap-10 max-w-7xl p-5 w-full">
          <Suspense
            fallback={
              <section className="flex flex-col gap-10 w-full">
                <h2 className="text-6xl md:text-7xl font-bold font-kate text-primary text-center tracking-tighter">
                  Current Favorites
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
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
