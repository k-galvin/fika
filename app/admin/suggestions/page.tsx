"use client";

import { useEffect, useState, useTransition } from "react";
import { getSuggestedCafes, approveSuggestion, denySuggestion } from "@/app/actions";
import { SuggestedCafe } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { Loader2, MapPin, ChevronLeft, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SuggestedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      const suggestedCafes = await getSuggestedCafes();
      if (suggestedCafes) {
        setSuggestions(suggestedCafes);
      }
      setLoading(false);
    }

    fetchSuggestions();
  }, []);

  const handleApprove = (id: number) => {
    startTransition(async () => {
      const result = await approveSuggestion(id);
      if (result.success) {
        toast.success("Cafe approved and added to the map!");
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(result.message || "Failed to approve cafe.");
      }
    });
  };

  const handleDeny = (id: number) => {
    startTransition(async () => {
      const result = await denySuggestion(id);
      if (result.success) {
        toast.success("Suggestion denied and removed.");
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(result.message || "Failed to deny suggestion.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 md:gap-12 items-center p-8 max-w-6xl mx-auto">
      <div className="w-full flex flex-col gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold font-kate">Manage Suggestions</h1>
      </div>
      
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-kate">{suggestion.name}</CardTitle>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{suggestion.address}, {suggestion.city}</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${suggestion.name} ${suggestion.address} ${suggestion.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    View on Map
                  </a>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {suggestion.photo_urls && suggestion.photo_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {suggestion.photo_urls.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted border">
                        <Image
                          src={url}
                          alt="Suggested photo"
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover"
                        />
                        {i === 3 && suggestion.photo_urls!.length > 4 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-bold">+{suggestion.photo_urls!.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Parking</span>
                    <span data-testid={`parking-${suggestion.id}`}>{suggestion.parking}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Seating</span>
                    <span data-testid={`seating-${suggestion.id}`}>{suggestion.seating}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Pricing</span>
                    <span data-testid={`pricing-${suggestion.id}`}>{suggestion.pricing}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Vibe</span>
                    <span data-testid={`vibe-${suggestion.id}`}>{suggestion.vibe}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Busyness</span>
                    <span data-testid={`busyness-${suggestion.id}`}>{suggestion.busyness}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestion.has_wifi && <Badge variant="secondary">Wifi</Badge>}
                  {suggestion.has_outlets && <Badge variant="secondary">Outlets</Badge>}
                  {suggestion.is_laptop_friendly && <Badge variant="secondary">Laptop Friendly</Badge>}
                  {suggestion.wine_bar && <Badge variant="secondary">Wine Bar</Badge>}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(suggestion.id)}
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => handleDeny(suggestion.id)}
                  variant="destructive"
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Deny
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <AdminEmptyState 
          message="No new cafe suggestions" 
          description="You've reviewed all suggested cafes. New submissions will appear here as they come in."
        />
      )}
    </div>
  );
}
