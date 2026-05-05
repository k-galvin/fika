"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { UserSavedCafe, UserVisit } from "@/lib/types";
import { LogVisitButton } from "@/components/log-visit-button";
import { SaveButton } from "@/components/save-button";
import { Award, Gem, Trophy, Sparkles, Compass, Sprout } from "lucide-react";

type ProfileCafesProps = {
  savedCafes: UserSavedCafe[];
  visitedCafes: UserVisit[];
  totalCafeCount?: number;
  friendView?: boolean;
};

export function ProfileCafes({
  savedCafes,
  visitedCafes,
  totalCafeCount = 0,
  friendView,
}: ProfileCafesProps) {
  const [activeTab, setActiveTab] = useState("visited");

  const visitedCount = visitedCafes.length;
  const percentage = totalCafeCount > 0 
    ? Math.round((visitedCount / totalCafeCount) * 100) 
    : 0;

  const getRank = (count: number) => {
    if (count >= 50) return { title: "Fika Legend", icon: Award, color: "text-amber-500" };
    if (count >= 30) return { title: "Elite Connoisseur", icon: Gem, color: "text-purple-500" };
    if (count >= 15) return { title: "Master Taster", icon: Trophy, color: "text-blue-500" };
    if (count >= 6) return { title: "Cafe Enthusiast", icon: Sparkles, color: "text-emerald-500" };
    if (count >= 1) return { title: "City Voyager", icon: Compass, color: "text-orange-500" };
    return { title: "Novice Explorer", icon: Sprout, color: "text-primary/40" };
  };

  const rank = getRank(visitedCount);
  const RankIcon = rank.icon;

  return (
    <div className="flex flex-col gap-8">
      {/* Editorial Stats Header */}
      <div className="flex flex-wrap items-center gap-x-12 gap-y-6 px-2 py-4 border-y border-primary/10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold">Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="font-kate font-bold text-3xl text-primary">{percentage}%</span>
            <span className="text-xs text-primary/40 font-kate italic">of Fika collection</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold">Rank</span>
          <div className="flex items-center gap-2">
            <RankIcon className={`size-5 ${rank.color}`} />
            <span className="font-kate font-bold text-xl text-primary">{rank.title}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold">Total Found</span>
          <div className="flex items-baseline gap-2">
            <span className="font-kate font-bold text-3xl text-primary">{visitedCount}</span>
            <span className="text-xs text-primary/40 font-kate italic">cafes visited</span>
          </div>
        </div>
      </div>

      <Card className="handwritten-border !border-primary/10 bg-secondary/10 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("visited")}
                className={`flex items-center gap-2 font-kate font-bold text-lg transition-all ${
                  activeTab === "visited"
                    ? "text-primary border-b-2 border-primary"
                    : "text-primary/40 hover:text-primary/60"
                }`}
              >
                Visited
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 font-kate font-bold text-lg transition-all ${
                  activeTab === "saved"
                    ? "text-primary border-b-2 border-primary"
                    : "text-primary/40 hover:text-primary/60"
                }`}
              >
                Saved
              </button>
            </div>
          </div>
          <CardDescription className="font-kate italic">
            {activeTab === "visited"
              ? friendView
                ? "A history of cafes they have visited."
                : "A record of your past fika moments."
              : friendView
              ? "Cafes they have marked as favorites for later."
              : "Your personal shortlist for future visits."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background/40 p-4 rounded-xl border border-primary/5 min-h-[12rem] max-h-[400px] overflow-y-auto custom-scrollbar">
            {activeTab === "visited" ? (
              <div>
                {visitedCafes && visitedCafes.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {visitedCafes.map((visitedCafe: UserVisit) => {
                      const cafeName =
                        visitedCafe.coffee_shops?.name || "Unknown Cafe";

                      return (
                        <div
                          key={visitedCafe.id}
                          className="flex justify-between items-center border-b border-primary/5 pb-3 last:border-b-0 group"
                        >
                          <div className="flex flex-col">
                            <Link
                              href={`/cafe/${visitedCafe.coffee_shop_id}`}
                              className="font-kate font-bold text-xl text-primary group-hover:underline decoration-primary/20 underline-offset-4"
                            >
                              {cafeName}
                            </Link>
                          </div>
                          <div className="flex items-center gap-4">
                            {visitedCafe.rating && (
                              <div className="flex items-center gap-1 font-kate font-bold text-primary/80">
                                <span className="text-primary/40">★</span>
                                <span>{visitedCafe.rating}</span>
                              </div>
                            )}
                            {!friendView && (
                              <div className="bg-background/80 rounded-full p-1 border border-primary/5 shadow-sm">
                                <LogVisitButton
                                  shopId={visitedCafe.coffee_shop_id}
                                  isInitiallyVisited={true}
                                  initialRating={visitedCafe.rating}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="font-kate italic text-primary/40 mb-6">
                      {friendView
                        ? "They haven't logged any visits yet!"
                        : "You haven't logged any visits yet!"}
                    </p>
                    {!friendView && (
                      <Button asChild variant="ghost" className="handwritten-border !border-primary/20">
                        <Link href="/discover">Log a Visit</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {savedCafes && savedCafes.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {savedCafes.map((savedCafe: UserSavedCafe) => {
                      const cafeName =
                        savedCafe.coffee_shops?.name || "Unknown Cafe";

                      return (
                        <div
                          key={savedCafe.coffee_shop_id}
                          className="flex justify-between items-center border-b border-primary/5 pb-3 last:border-b-0 group"
                        >
                          <div className="flex flex-col">
                            <Link
                              href={`/cafe/${savedCafe.coffee_shop_id}`}
                              className="font-kate font-bold text-xl text-primary group-hover:underline decoration-primary/20 underline-offset-4"
                            >
                              {cafeName}
                            </Link>
                          </div>
                          {!friendView && (
                            <div className="bg-background/80 rounded-full p-1 border border-primary/5 shadow-sm">
                              <SaveButton
                                shopId={savedCafe.coffee_shop_id}
                                isInitiallySaved={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="font-kate italic text-primary/40 mb-6">
                      {friendView
                        ? "They haven't saved any cafes yet!"
                        : "You haven't saved any cafes yet!"}
                    </p>
                    {!friendView && (
                      <Button asChild variant="ghost" className="handwritten-border !border-primary/20">
                        <Link href="/discover">Find Cafes to Save</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
