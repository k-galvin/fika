import { Suspense } from "react";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { FeaturedCafes } from "./featured-cafes";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user } = await getUser();

  return (
    <main className="min-h-dvh flex flex-col items-center pt-2 md:pt-8 relative">
      {/* Accent Images - Symmetrical Side Layout */}
      
      {/* Row 1 */}
      <Image
        src="/cardamomBun.png"
        alt="decoration"
        width={96}
        height={96}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[5vh] left-10 z-[-1]"
      />
      <Image
        src="/hotMatchaLatte.png"
        alt="decoration"
        width={100}
        height={100}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[5vh] right-10 z-[-1]"
      />

      {/* Row 2 */}
      <Image
        src="/icedLatte.png"
        alt="decoration"
        width={96}
        height={96}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[30vh] left-14 z-[-1]"
      />
      <Image
        src="/hotLatte.png"
        alt="decoration"
        width={96}
        height={96}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[30vh] right-14 z-[-1]"
      />

      {/* Row 3 */}
      <Image
        src="/cakeSlice.png"
        alt="decoration"
        width={110}
        height={110}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[55vh] left-10 z-[-1]"
      />
      <Image
        src="/swanLatte.png"
        alt="decoration"
        width={96}
        height={96}
        style={{ width: 'auto', height: 'auto' }}
        className="hidden lg:block absolute top-[55vh] right-10 z-[-1]"
      />

      <div className="flex-1 w-full flex flex-col gap-4 md:gap-10 items-center pt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        <div className="flex-1 flex flex-col gap-4 md:gap-10 max-w-7xl px-4 py-2 md:p-5 w-full">
          <Suspense
            fallback={
              <section className="flex flex-col gap-2 md:gap-6 w-full">
                <h2 className="text-4xl md:text-7xl font-bold font-kate text-primary text-center tracking-tighter">
                  Current Favorites
                </h2>
                {/* Mirrors the polaroid carousel: 1 centered card on phones, 3-up on desktop */}
                <div className="flex overflow-hidden -mx-4 pt-3 pb-0 md:grid md:grid-cols-3 md:gap-10 md:mx-0 md:px-4 md:pt-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-full shrink-0 flex justify-center px-6 md:w-auto md:p-0 md:block ${
                        i > 0 ? "hidden md:block" : ""
                      }`}
                    >
                      <div className="w-full max-w-[278px] bg-[#fffdf8] p-3 pb-5 shadow-md border border-primary/5 animate-pulse">
                        <div className="aspect-[4/5] w-full bg-skeleton-brown" />
                        <div className="mt-3.5 h-6 w-2/3 bg-skeleton-brown rounded" />
                        <div className="mt-1.5 h-4 w-1/3 bg-skeleton-brown rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            }
          >
            <FeaturedCafes user={user} />
          </Suspense>
        </div>
      </div>
      <Footer user={user} />
    </main>
  );
}
