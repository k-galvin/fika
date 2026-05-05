"use client";

import { useState, useEffect, useTransition } from "react";
import { getCities, addCity, deleteCity } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Loader2, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type City = {
  id: number;
  name: string;
};

export default function CitiesAdminPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [newCityName, setNewCityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCities = async () => {
    const data = await getCities();
    setCities(data as City[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    startTransition(async () => {
      const result = await addCity(newCityName.trim());
      if (result.success) {
        toast.success("City added successfully!");
        setNewCityName("");
        fetchCities();
      } else {
        toast.error(result.message || "Failed to add city");
      }
    });
  };

  const handleDeleteCity = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This might affect cafes linked to this city.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCity(id);
      if (result.success) {
        toast.success("City deleted");
        fetchCities();
      } else {
        toast.error(result.message || "Failed to delete city");
      }
    });
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8 max-w-3xl mx-auto font-kate animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild className="handwritten-border">
          <Link href="/admin">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">Manage Cities</h1>
          <p className="text-muted-foreground">Add or remove cities available in the application.</p>
        </div>
      </div>

      {/* Add City Form */}
      <Card className="handwritten-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Add New City</CardTitle>
          <form onSubmit={handleAddCity} className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/40" />
              <Input
                placeholder="e.g. New York"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="pl-10 handwritten-border !border-primary/10"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending || !newCityName.trim()} className="handwritten-border">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4 mr-2" /> Add</>}
            </Button>
          </form>
        </CardHeader>
      </Card>

      {/* Cities List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Existing Cities</h2>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="size-8 animate-spin text-primary/20" />
          </div>
        ) : cities.length === 0 ? (
          <div className="bg-secondary/5 border-2 border-dashed border-primary/10 rounded-2xl p-12 text-center">
            <p className="italic text-primary/40">No cities found. Add your first city above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cities.map((city) => (
              <div 
                key={city.id}
                className="bg-card p-4 rounded-xl border border-primary/10 flex items-center justify-between group hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/5 p-2 rounded-lg">
                    <MapPin className="size-4 text-primary/60" />
                  </div>
                  <span className="font-bold text-lg">{city.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => handleDeleteCity(city.id, city.name)}
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
