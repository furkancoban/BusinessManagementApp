import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
        <p className="text-sm sm:text-base text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}
