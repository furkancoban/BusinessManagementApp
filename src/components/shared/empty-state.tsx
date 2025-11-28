import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base sm:text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4 sm:mt-6">{action}</div>}
    </div>
  );
}
