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
import { Bookmark, History } from "lucide-react";
import { UserSavedCafe, UserVisit } from "@/lib/types";
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("visited")}
              className={`flex items-center gap-2 pb-1 ${
                activeTab === "visited"
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <History className="h-5 w-5" />
              Visited Cafes
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 pb-1 ml-4 ${
                activeTab === "saved"
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Bookmark className="h-5 w-5" />
              Saved Cafes
            </button>
          </div>
        </div>
        <CardDescription>
          {activeTab === "visited"
            ? friendView
              ? "A history of cafes they have visited."
              : "A history of cafes you've visited."
            : friendView
            ? "Cafes they have marked as favorites for later."
            : "Cafes you've marked as favorites for later."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeTab === "visited" ? (
          <div>
            {visitedCafes && visitedCafes.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {visitedCafes.map((visitedCafe: UserVisit) => {
                  const cafeName =
                    visitedCafe.coffee_shops?.name || "Unknown Cafe";

                  return (
                    <div
                      key={visitedCafe.id} // Use the visit ID as key
                      className="flex justify-between items-center border-b pb-2 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <Link
                          href={`/cafe/${visitedCafe.coffee_shop_id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {cafeName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Visited on{" "}
                          {new Date(
                            visitedCafe.visited_at || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {visitedCafe.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{visitedCafe.rating}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {friendView
                    ? "They haven't logged any visits yet!"
                    : "You haven't logged any visits yet!"}
                </p>
                <Button asChild>
                  <Link href="/discover">Log a Visit</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {savedCafes && savedCafes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {savedCafes.map((savedCafe: UserSavedCafe) => {
                  const cafeName =
                    savedCafe.coffee_shops?.name || "Unknown Cafe";

                  return (
                    <div
                      key={savedCafe.coffee_shop_id}
                      className="flex justify-between items-center border-b pb-2 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <Link
                          href={`/cafe/${savedCafe.coffee_shop_id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {cafeName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Saved on{" "}
                          {new Date(
                            savedCafe.saved_at || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {!friendView && (
                        <SaveButton
                          shopId={savedCafe.coffee_shop_id}
                          isInitiallySaved={true}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {friendView
                    ? "They haven't saved any cafes yet!"
                    : "You haven't saved any cafes yet!"}
                </p>
                <Button asChild>
                  <Link href="/discover">Find Cafes to Save</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
