"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Users, ShoppingCart, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "product" | "customer" | "order";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Ürün";
      case "customer":
        return "Müşteri";
      case "order":
        return "Sipariş";
      default:
        return "";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-lg bg-muted/50 text-sm font-normal text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Ara (ürün, müşteri, sipariş)...</span>
        <span className="inline-flex lg:hidden">Ara...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Ara</DialogTitle>
            <DialogDescription>
              Ürün, müşteri veya sipariş arayın
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aranıyor...
              </div>
            ) : query.length < 2 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Arama yapmak için en az 2 karakter girin
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.href)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

