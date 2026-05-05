"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { GripVertical, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePhotoOrder } from "@/app/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Photo {
  id: number;
  photo_url: string;
  is_primary: boolean | null;
}

interface SortablePhotoProps {
  photo: Photo;
  index: number;
}

function SortablePhoto({ photo, index }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const getExpandedPhotoClass = (idx: number) => {
    if (idx === 0) return "md:col-start-1 md:row-start-1";
    if (idx === 1) return "md:col-start-2 md:row-start-1";
    if (idx === 2) return "md:col-start-1 md:row-start-2";
    if (idx === 3) return "md:col-start-2 md:row-start-2";
    return "";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-xl overflow-hidden handwritten-border !border-primary/10 shadow-sm bg-secondary/5 group",
        getExpandedPhotoClass(index)
      )}
    >
      <Image
        src={photo.photo_url}
        alt="Gallery Photo"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
      {index < 4 && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <Badge variant="secondary" className="bg-primary/80 text-white border-none scale-75 origin-top-right backdrop-blur-sm">
            Grid View
          </Badge>
        </div>
      )}
      {photo.is_primary && (
        <Badge variant="journal" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm scale-75 origin-top-left z-10">
          Primary
        </Badge>
      )}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
      >
        <div className="bg-background/90 p-2 rounded-full shadow-lg">
          <GripVertical className="size-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

interface SortablePhotoGalleryProps {
  shopId: number;
  initialPhotos: Photo[];
  onSave: () => void;
  onCancel: () => void;
}

export function SortablePhotoGallery({
  shopId,
  initialPhotos,
  onSave,
  onCancel,
}: SortablePhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const photoOrders = photos.map((photo, index) => ({
      id: photo.id,
      sort_order: index,
    }));

    const result = await updatePhotoOrder(shopId, photoOrders);
    if (result.success) {
      toast.success("Photo order updated!");
      onSave();
    } else {
      toast.error(result.message || "Failed to update photo order.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div className="flex flex-col">
          <span className="font-bold text-lg">Rearrange Mode</span>
          <span className="text-xs text-muted-foreground">The first 4 photos will appear in the main cafe grid.</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Check className="size-4 mr-2" />
                Save Order
              </>
            )}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 grid-flow-row-dense">
            {photos.map((photo, index) => (
              <SortablePhoto key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
