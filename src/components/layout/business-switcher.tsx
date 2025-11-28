"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

async function fetchBusinesses() {
  const res = await fetch("/api/business");
  if (!res.ok) throw new Error("Failed to fetch businesses");
  return res.json();
}

export function BusinessSwitcher() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [switching, setSwitching] = useState(false);

  const { data } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
    enabled: !!session,
  });

  const businesses = data?.businesses || [];
  const currentBusiness = businesses.find(
    (b: any) => b.id === session?.user?.businessId
  );

  const handleSwitch = async (business: any) => {
    if (business.id === session?.user?.businessId) return;

    setSwitching(true);
    try {
      const response = await fetch("/api/business/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      await update({
        businessId: result.businessId,
        businessName: result.businessName,
        businessSlug: result.businessSlug,
        role: result.role,
      });

      toast({
        title: "İşletme Değiştirildi",
        description: `${result.businessName} işletmesine geçildi.`,
      });

      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setSwitching(false);
    }
  };

  if (!session?.user?.businessId) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/setup")}>
        <Plus className="h-4 w-4 mr-2" />
        İşletme Oluştur
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={switching}>
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[150px] truncate">
            {currentBusiness?.name || session.user.businessName}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {businesses.map((business: any) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => handleSwitch(business)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{business.name}</span>
              </div>
              {business.id === session?.user?.businessId && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/setup")}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İşletme Ekle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

