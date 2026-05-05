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
import Image from "next/image";

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
    <section className="relative -mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
        03
      </div>
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex justify-between items-center relative">
          <h2 className="text-4xl font-bold font-kate text-primary tracking-tighter flex items-center gap-3">
            <BookOpen className="size-8 rotate-[-5deg]" />
            Your Journal
          </h2>
          {/* Decorative Doodle */}
          <div className="hidden lg:block absolute -left-12 -top-12 opacity-10 rotate-[-15deg] select-none pointer-events-none">
            <Image 
              src="/swanLatte.png" 
              alt="Swan Latte Doodle" 
              width={100} 
              height={100}
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <Button
            variant="journal"
            onClick={handleAddClick}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="relative group pt-6"
              >
                {/* Washi Tape - Unified and Overlapping */}
                <div 
                  className="washi-tape top-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-accent/30 rotate-[1deg] z-20"
                />
                
                <div className="paper-texture bg-secondary/10 p-6 pt-10 rounded-sm shadow-md handwritten-border !border-primary/5 flex flex-col gap-4 relative overflow-hidden transition-transform hover:scale-[1.02] duration-300">
                  {/* Binder Rings */}
                  <div className="absolute left-2 top-0 bottom-0 binder-rings opacity-20 w-4" />
                  
                  <div className="flex justify-between items-start relative z-10 pl-4">
                    <span className="font-kate text-primary/40 text-sm uppercase tracking-widest font-bold border-b border-primary/10 pb-1">
                      {new Date(entry.visit_date).toLocaleDateString("en-US", {
                        month: "short",
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
                  <p className="font-kate text-2xl text-primary/80 whitespace-pre-wrap leading-[2rem] notebook-lines pl-4">
                    {entry.content}
                  </p>
                </div>
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
                className="min-h-[250px] w-full rounded-md border-2 border-primary/10 bg-background px-6 py-4 text-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 handwritten-border paper-texture notebook-lines leading-[2rem]"
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
