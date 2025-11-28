"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerSingleProps & {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  initialFocus?: boolean;
};

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={tr}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-gradient-to-br from-white to-slate-50/50 rounded-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-2 pb-4 relative items-center border-b border-slate-200/60 mb-3",
        caption_label: "text-base font-semibold text-slate-900 tracking-wide",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 rounded-lg bg-slate-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-200 p-0 opacity-70 hover:opacity-100 hover:shadow-md flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-slate-600 rounded-lg w-10 h-10 font-semibold text-xs uppercase tracking-wider flex items-center justify-center",
        row: "flex w-full mt-1.5 gap-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative rounded-lg transition-all duration-200 [&:has([aria-selected].day-range-end)]:rounded-lg [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-gradient-to-br [&:has([aria-selected])]:from-blue-500 [&:has([aria-selected])]:to-indigo-600 first:[&:has([aria-selected])]:rounded-lg last:[&:has([aria-selected])]:rounded-lg focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-medium rounded-lg transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95 aria-selected:opacity-100"
        ),
        day_selected: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:text-white focus:from-blue-600 focus:to-indigo-700 focus:text-white shadow-md font-semibold",
        day_today: "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300 font-semibold",
        day_outside: "day-outside text-slate-400 opacity-40 aria-selected:bg-slate-200/50 aria-selected:text-slate-500 aria-selected:opacity-50",
        day_disabled: "text-slate-300 opacity-30 cursor-not-allowed hover:bg-transparent hover:scale-100",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

