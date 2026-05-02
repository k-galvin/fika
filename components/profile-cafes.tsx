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

type ProfileCafesProps = {
  savedCafes: UserSavedCafe[];
  visitedCafes: UserVisit[];
  friendView?: boolean;
};

export function ProfileCafes({
  savedCafes,
  visitedCafes,
  friendView,
}: ProfileCafesProps) {
  const [activeTab, setActiveTab] = useState("visited");

  return (
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
                          <span className="font-kate text-[10px] uppercase tracking-widest text-primary/40">
                            Visited on{" "}
                            {new Date(
                              visitedCafe.visited_at || ""
                            ).toLocaleDateString()}
                          </span>
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
                          <span className="font-kate text-[10px] uppercase tracking-widest text-primary/40">
                            Saved on{" "}
                            {new Date(
                              savedCafe.saved_at || ""
                            ).toLocaleDateString()}
                          </span>
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
  );
}

