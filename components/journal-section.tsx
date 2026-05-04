"use client";

import { Database } from "@/lib/supabase/database.types";
import { User } from "@supabase/supabase-js";
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { addJournalEntry, updateJournalEntry, deleteJournalEntry } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

export function JournalSection({
  cafeId,
  user,
  entries,
}: {
  cafeId: number;
  user: User | null;
  entries: JournalEntry[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleAddClick = () => {
    setEditingEntry(null);
    setContent("");
    setVisitDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setContent(entry.content);
    setVisitDate(entry.visit_date);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    
    setIsPending(true);
    const result = await deleteJournalEntry(entryId);
    setIsPending(false);
    
    if (result.success) {
      toast.success("Entry deleted");
      router.refresh();
    } else {
      toast.error(result.message || "Failed to delete entry");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    let result;
    if (editingEntry) {
      result = await updateJournalEntry(editingEntry.id, content, visitDate);
    } else {
      result = await addJournalEntry(cafeId, content, visitDate);
    }
    setIsPending(false);

    if (result.success) {
      toast.success(editingEntry ? "Entry updated" : "Entry added");
      setIsModalOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  if (!user) return null;

  return (
    <section className="relative mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
        04
      </div>
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold font-kate text-primary tracking-tighter flex items-center gap-3">
            <BookOpen className="size-8" />
            Your Journal
          </h2>
          <Button
            variant="journal"
            onClick={handleAddClick}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.length === 0 ? (
            <div className="col-span-full bg-secondary/5 border-2 border-dashed border-primary/10 rounded-2xl p-12 text-center">
              <p className="font-kate italic text-primary/40 text-xl">
                No entries yet. Start keeping track of your visits!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-secondary/10 p-6 rounded-2xl handwritten-border !border-primary/10 shadow-sm flex flex-col gap-4 group relative"
              >
                <div className="flex justify-between items-start">
                  <span className="font-kate text-primary/40 text-sm uppercase tracking-widest font-bold">
                    {new Date(entry.visit_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(entry)}
                      className="text-primary/40 hover:text-primary transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(entry.id)}
                      className="text-destructive/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="font-kate text-lg text-primary/80 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="font-kate">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-primary tracking-tighter">
              {editingEntry ? "Edit Entry" : "New Journal Entry"}
            </DialogTitle>
            <DialogDescription className="italic text-primary/60">
              Note down what you liked about your visit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="handwritten-border !border-primary/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Notes</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you order? How was the atmosphere today?"
                required
                className="min-h-[150px] w-full rounded-md border-2 border-primary/10 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 handwritten-border"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !content.trim()} className="handwritten-border !border-primary/20">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                {editingEntry ? "Save Changes" : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
