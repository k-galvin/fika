import { Card, CardContent } from "@/components/ui/card";
import { Coffee } from "lucide-react";

interface AdminEmptyStateProps {
  message: string;
  description?: string;
}

export function AdminEmptyState({ message, description }: AdminEmptyStateProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-dashed border-2 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
          <Coffee className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-2xl font-bold font-kate text-foreground mb-2">{message}</h3>
        {description && (
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
