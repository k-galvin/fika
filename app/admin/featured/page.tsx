"use client";

import { useState, useEffect, useTransition } from "react";
import { searchCafes, toggleFeaturedCafe, getFeaturedCafes } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Search, MapPin, Loader2, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CafeSearchResult = {
  id: number;
  name: string;
  city: string;
};

type FeaturedCafe = {
  id: number;
  name: string;
  city: string;
  is_featured: boolean | null;
};

export default function FeaturedAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CafeSearchResult[]>([]);
  const [featuredCafes, setFeaturedCafes] = useState<FeaturedCafe[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchFeatured = async () => {
    const data = await getFeaturedCafes();
    setFeaturedCafes(data as FeaturedCafe[]);
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    const results = await searchCafes(searchTerm);
    setSearchResults(results as CafeSearchResult[]);
    setSearching(false);
  };

  const handleToggle = (cafeId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    if (newStatus && featuredCafes.length >= 3) {
      toast.error("You can only have 3 featured cafes. Remove one first.");
      return;
    }

    startTransition(async () => {
      const result = await toggleFeaturedCafe(cafeId, newStatus);
      if (result.success) {
        toast.success(newStatus ? "Cafe featured!" : "Removed from featured");
        fetchFeatured();
        // Update search results list if it contains the cafe
        setSearchResults(prev => 
            prev.map(c => c.id === cafeId ? { ...c } : c)
        );
      } else {
        toast.error(result.message || "Failed to update status");
      }
    });
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto font-kate animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild className="handwritten-border">
          <Link href="/admin">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">Manage Featured</h1>
          <p className="text-muted-foreground">Select exactly 3 cafes to highlight on the home page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Current Featured Section */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="size-5 text-yellow-500 fill-yellow-500" />
            Currently Featured ({featuredCafes.length}/3)
          </h2>
          <div className="flex flex-col gap-4">
            {featuredCafes.length === 0 ? (
              <div className="bg-secondary/5 border-2 border-dashed border-primary/10 rounded-2xl p-8 text-center">
                <p className="italic text-primary/40 text-sm">No cafes featured yet.</p>
              </div>
            ) : (
              featuredCafes.map((cafe) => (
                <Card key={cafe.id} className="handwritten-border shadow-sm group">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{cafe.name}</CardTitle>
                      <div className="flex items-center gap-1 text-primary/40 text-[10px] uppercase tracking-widest font-bold">
                        <MapPin className="size-2" />
                        {cafe.city}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={() => handleToggle(cafe.id, true)}
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isPending}
                    >
                      <X className="size-4" />
                    </Button>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Search className="size-5 text-primary/40" />
            Find Cafes to Feature
          </h2>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/40" />
              <Input
                placeholder="Search by cafe name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 handwritten-border !border-primary/10"
              />
            </div>
            <Button type="submit" disabled={searching} className="handwritten-border">
              {searching ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {searchResults.map((cafe) => {
              const isAlreadyFeatured = featuredCafes.some(f => f.id === cafe.id);
              return (
                <div 
                  key={cafe.id}
                  className="bg-secondary/5 p-4 rounded-xl border border-primary/5 flex flex-col gap-4 hover:border-primary/10 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight">{cafe.name}</span>
                    <span className="text-[10px] text-primary/40 uppercase tracking-widest">{cafe.city}</span>
                  </div>
                  <Button
                    onClick={() => handleToggle(cafe.id, isAlreadyFeatured)}
                    variant={isAlreadyFeatured ? "outline" : "journal"}
                    disabled={isPending}
                    className={cn(
                        "w-full gap-2 text-xs h-8",
                        isAlreadyFeatured && "border-yellow-500/50 text-yellow-600 hover:bg-yellow-50"
                    )}
                  >
                    {isAlreadyFeatured ? (
                      <>
                        <Star className="size-3 fill-yellow-500 text-yellow-500" />
                        Featured
                      </>
                    ) : (
                      <>
                        <Star className="size-3" />
                        Feature this Spot
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
            {searchResults.length === 0 && searchTerm && !searching && (
              <p className="col-span-full text-center italic text-primary/40 text-sm mt-4">
                No cafes found. Try a different search term.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
