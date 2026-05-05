"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Search, ArrowLeft } from "lucide-react";
import { getAllCafes, deleteCafe } from "@/app/actions";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Cafe = {
  id: number;
  name: string | null;
  city: string | null;
};

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cafeToDelete, setCafeToDelete] = useState<Cafe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCafes();
  }, []);

  async function fetchCafes() {
    setLoading(true);
    const data = await getAllCafes();
    setCafes(data);
    setLoading(false);
  }

  const filteredCafes = cafes.filter(
    (cafe) =>
      cafe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDeleteConfirm() {
    if (!cafeToDelete) return;

    setIsDeleting(true);
    const result = await deleteCafe(cafeToDelete.id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);

    if (result.success) {
      toast.success(`"${cafeToDelete.name}" has been deleted.`);
      fetchCafes();
    } else {
      toast.error(result.message || "Failed to delete cafe.");
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-kate">Manage Cafes</h1>
          <p className="text-muted-foreground">
            View and manage all cafes in the system.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or city..."
          className="pl-10 h-12 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center py-12 font-kate italic text-primary/40">Loading cafes...</p>
        ) : filteredCafes.length === 0 ? (
          <p className="text-center py-12 font-kate italic text-primary/40">No cafes found matching your search.</p>
        ) : (
          filteredCafes.map((cafe) => (
            <Card key={cafe.id} className="overflow-hidden group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-kate">{cafe.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {cafe.city}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/cafe/${cafe.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setCafeToDelete(cafe);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-kate">Delete Cafe?</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete <strong>{cafeToDelete?.name}</strong>? 
              This action is permanent and will remove all associated photos, journal entries, and visits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
