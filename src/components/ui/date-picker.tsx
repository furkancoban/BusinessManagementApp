"use client";

import * as React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Tarih seçin", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-medium relative h-10",
            "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50",
            "border-2 border-slate-200 hover:border-blue-300 transition-all duration-200",
            "shadow-sm hover:shadow-md rounded-lg",
            "group",
            !date && "text-slate-500",
            date && "text-slate-900 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50",
            className
          )}
        >
          <CalendarIcon className={cn(
            "mr-2 h-4 w-4 transition-colors duration-200",
            date ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
          )} />
          <span className="flex-1 text-left">
            {date ? (
              <span className="font-semibold text-slate-900">
                {format(date, "dd MMMM yyyy", { locale: tr })}
              </span>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </span>
          {date && (
            <X
              className="ml-2 h-4 w-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-all duration-200"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-xl border-0 bg-white/95 backdrop-blur-sm" align="start">
        <div className="p-3 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs hover:bg-slate-100 transition-colors rounded-lg"
            onClick={handleClear}
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Temizle
          </Button>
        </div>
        <div className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const formattedDate = format(selectedDate, "yyyy-MM-dd");
                onChange(formattedDate);
                setOpen(false);
              }
            }}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

