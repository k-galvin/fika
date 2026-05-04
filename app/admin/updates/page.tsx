"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getCafeUpdates,
  approveUpdateAndDenyOthers,
  denyUpdates,
} from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { Loader2, Coffee, ChevronLeft, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Raw update structure from getCafeUpdates
type RawUpdate = {
  id: number;
  cafe_id: number;
  cafe_name: string;
  field: string;
  new_value: string;
  user_id: string;
  created_at: string;
};

// Structure for a single suggestion value with its votes
type Suggestion = {
  value: string;
  count: number;
  ids: number[]; // Keep track of original update IDs
};

// Final grouped structure for display
type GroupedUpdate = {
  cafe_name: string;
  field: string;
  suggestions: Suggestion[];
  totalSuggestions: number;
  allIds: number[];
};

export default function UpdatesPage() {
  const [groupedUpdates, setGroupedUpdates] = useState<GroupedUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function fetchAndGroupUpdates() {
    setIsLoading(true);
    const rawUpdates = (await getCafeUpdates()) as RawUpdate[];

    if (!rawUpdates || rawUpdates.length === 0) {
      setGroupedUpdates([]);
      setIsLoading(false);
      return;
    }

    // Grouping logic
    const groups: Record<string, GroupedUpdate> = {};

    rawUpdates.forEach((update) => {
      const key = `${update.cafe_name}___${update.field}`;
      if (!groups[key]) {
        groups[key] = {
          cafe_name: update.cafe_name,
          field: update.field,
          suggestions: [],
          totalSuggestions: 0,
          allIds: [],
        };
      }

      // Add the raw ID to the main list
      groups[key].allIds.push(update.id);
      groups[key].totalSuggestions += 1;

      // Find or create a suggestion entry for this value
      const suggestion = groups[key].suggestions.find(
        (s) => s.value === update.new_value
      );

      if (suggestion) {
        suggestion.count += 1;
        suggestion.ids.push(update.id);
      } else {
        groups[key].suggestions.push({
          value: update.new_value,
          count: 1,
          ids: [update.id],
        });
      }
    });

    // Sort suggestions within each group by count
    Object.values(groups).forEach((group) => {
      group.suggestions.sort((a, b) => b.count - a.count);
    });

    setGroupedUpdates(Object.values(groups));
    setIsLoading(false);
  }

  useEffect(() => {
    fetchAndGroupUpdates();
  }, []);

  const handleApproveMostVoted = (group: GroupedUpdate) => {
    if (group.suggestions.length === 0) return;

    const mostVoted = group.suggestions[0];
    const winningId = mostVoted.ids[0]; // Pick one ID to represent the winning value
    const otherIds = group.allIds.filter((id) => id !== winningId);

    startTransition(async () => {
      const result = await approveUpdateAndDenyOthers(winningId, otherIds);
      if (result.success) {
        toast.success(
          `Updated ${group.field.replace(/_/g, " ")} for ${group.cafe_name}`
        );
        fetchAndGroupUpdates(); // Refetch to update the UI
      } else {
        toast.error(result.message || "Failed to approve update.");
      }
    });
  };

  const handleDenyAll = (group: GroupedUpdate) => {
    startTransition(async () => {
      const result = await denyUpdates(group.allIds);
      if (result.success) {
        toast.success(`Denied all updates for ${group.cafe_name}`);
        fetchAndGroupUpdates(); // Refetch to update the UI
      } else {
        toast.error(result.message || "Failed to deny updates.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading updates...</p>
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
        <h1 className="text-4xl font-bold font-kate">Manage Updates</h1>
      </div>

      {groupedUpdates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {groupedUpdates.map((group, index) => (
            <Card
              key={index}
              data-testid={`group-${group.cafe_name}-${group.field}`}
              className="flex flex-col"
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Coffee className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl font-kate">{group.cafe_name}</CardTitle>
                </div>
                <p data-testid="field" className="text-sm text-muted-foreground">
                  Update requested for <span className="font-semibold text-foreground capitalize">{group.field.replace(/_/g, ' ')}</span>
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-3">
                  {group.suggestions.map((suggestion, sIndex) => (
                    <div
                      key={suggestion.value}
                      className={`p-3 rounded-lg border transition-colors ${
                        sIndex === 0
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
                          : "bg-muted/30 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-foreground">
                          {suggestion.value}
                        </span>
                        {sIndex === 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            Most Voted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.count} suggestion{suggestion.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4 text-xs text-muted-foreground text-right italic">
                  Total of {group.totalSuggestions} user report{group.totalSuggestions > 1 ? 's' : ''}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleApproveMostVoted(group)}
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Approve Popular
                </Button>
                <Button
                  onClick={() => handleDenyAll(group)}
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 text-destructive hover:bg-destructive/5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Deny All
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <AdminEmptyState 
          message="No pending updates" 
          description="The community hasn't reported any changes lately. Everything is looking good!"
        />
      )}
    </div>
  );
}
